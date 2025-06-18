#include "net_scan.h"

uint32_t IPAddrStrToUInt32(const char *ip_addr_str)
{
    uint32_t ip_addr_uint32 = 0;
    if (inet_pton(AF_INET, ip_addr_str, &ip_addr_uint32) < 1)
    {
        throw std::invalid_argument("Error: IPAddrStrToUInt32, invalid IP address.\n");
    }
    // Return as host order to make incrementing with scan functions easier.
    return ntohl(ip_addr_uint32);
}

void SplitCIDR(std::string &cidr_string, size_t slash_pos, std::string &ip_addr_string, int &num_prefix_bits)
{
    if (slash_pos > 15)
    {
        throw std::invalid_argument("Error: SplitCIDR, invalid CIDR IP address format.\n");
    }

    // Check that ip addr is valid.
    ip_addr_string = cidr_string.substr(0, slash_pos);
    struct in_addr valid_addr = {0};
    int err = inet_pton(AF_INET, ip_addr_string.c_str(), &valid_addr);
    if (err != 1)
    {
        throw std::invalid_argument("Error: SplitCIDR, invalid ip address format.\n");
    }
    // Check that the subnet mask is valid.
    std::string prefix_string = cidr_string.substr(slash_pos + 1);
    num_prefix_bits = std::stoi(prefix_string);
    if (num_prefix_bits < 8 || num_prefix_bits > 31)
    {
        throw std::invalid_argument(
            "Error: SplitCIDR, invalid IPv4 prefix: must be greater than 8 and less than 32.\n");
    }
}

// Used with NetScan::CIDRScan() -> 127.3.59.1/15 should be start: 127.0.0.0, end: 127.3.255.255. Here start_ip_uint
// shall be passed as the ntohl() 127.0.0.0 uint form.
void DetermineIPRange(int num_prefix_bits, uint32_t &start_ip_uint, uint32_t &end_ip_uint)
{
    uint32_t tmp = start_ip_uint;
    uint32_t mask = (0xFFFFFFFFUL << (32 - num_prefix_bits)) & 0xFFFFFFFFUL;
    start_ip_uint = tmp & mask;
    end_ip_uint = tmp | (~mask);
}

int SpawnConnCheckSocket()
{
    int sock_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (sock_fd < 0)
    {
        std::error_code ec(errno, std::system_category());
        throw std::system_error(ec, "Error: SpawnConnCheckSocket, failed to create socket.\n");
    }

    // Avoid sending TCP SYN retransmissions, generally Linux will set the first timeout 1 second before doubling
    // on each attempt.
    struct timeval timeout;
    timeout.tv_sec = 0;      // Timeout in seconds.
    timeout.tv_usec = 50000; // 0.05 seconds.
    if (setsockopt(sock_fd, SOL_SOCKET, SO_SNDTIMEO, (char *)&timeout, sizeof(timeout)) < 0)
    {
        close(sock_fd);
        std::error_code ec(errno, std::system_category());
        throw std::system_error(ec, "Error: SpawnConnCheckSocket, failed to set socket option: SO_SNDTIMEO.\n");
        exit(1);
    }

    return sock_fd;
}

NetScan::NetScan() : m_sockaddr{AF_INET, 0, {0}, {0}}, sock_fd{-1}
{
    memset(&m_sockaddr, 0, sizeof(m_sockaddr));
    int port = 443;
    m_sockaddr.sin_family = AF_INET;
    m_sockaddr.sin_port = htons(port);
    m_sockaddr.sin_addr.s_addr = -1;
}

NetScan::~NetScan()
{
    close(sock_fd);
}

std::string NetScan::GetHostname()
{
    // From netdb.h -> NI_MAXHOST = 1025, NI_MAXSERV = 32.
    char hostname_buf[NI_MAXHOST] = {0};
    char service[NI_MAXSERV] = {0};
    // getnameinfo will lead to memory still reachable upon termination due to a libc bug, so a suppression file is
    // used. See:
    int getNameInfoReturnValue = getnameinfo((struct sockaddr *)&m_sockaddr, sizeof(struct sockaddr_in), hostname_buf,
                                             NI_MAXHOST, service, NI_MAXSERV, NI_NAMEREQD);
    if (getNameInfoReturnValue == 0)
    {
        return std::string{hostname_buf};
    }
    else
    {
        return std::string{};
    }
}

// For checking one off requests.
std::vector<std::string> NetScan::Check(std::string ip_addr, Mode mode)
{
    const char *ip_addr_char_arr = ip_addr.c_str();
    uint32_t ip_addr_uint = IPAddrStrToUInt32(ip_addr_char_arr);
    ;
    std::vector<std::string> host_data;
    bool host_up = mode == Mode::PING ? PingCheck(ip_addr_uint) : ConnectCheck(ip_addr_uint);
    if (host_up)
    {
        host_data.emplace_back(ip_addr);
        m_sockaddr.sin_addr.s_addr = htonl(ip_addr_uint);
        std::string hostname = GetHostname();
        host_data.emplace_back(hostname);
    }

    return host_data;
}

// NOTE: ip_addr_uint is given in host order, convert to network order before using.
bool NetScan::PingCheck(uint32_t ip_addr_uint)
{
    m_sockaddr.sin_addr.s_addr = htonl(ip_addr_uint);
    char ip_addr_str[INET_ADDRSTRLEN] = {0};
    const char *res = inet_ntop(AF_INET, &(m_sockaddr.sin_addr.s_addr), ip_addr_str, INET_ADDRSTRLEN);
    if (res == nullptr)
    {
        throw std::invalid_argument("Error: PingCheck, IP address format error (ip_addr_uint).\n");
    }
    std::string cmd = "ping -c 1 -W 1 ";
    cmd.append(ip_addr_str);
    cmd.append(" > /dev/null 2>&1");

    int err = system(cmd.c_str());
    if (err == 0)
    {
        return true;
    }
    else
    {
        return false;
    }
    return true;
}

// Will exhaust the kernels default retransmission attempts in the event that the target IP address is filtering
// port 80. Additionally may result in a false positive if the target disconnects between ARP cache updates.
bool NetScan::ConnectCheck(uint32_t ip_addr_uint)
{
    errno = 0;
    sock_fd = SpawnConnCheckSocket();
    m_sockaddr.sin_addr.s_addr = htonl(ip_addr_uint);
    char ip_addr_str[INET_ADDRSTRLEN] = {0};
    if (inet_ntop(AF_INET, &(m_sockaddr.sin_addr.s_addr), ip_addr_str, INET_ADDRSTRLEN) == NULL)
    {
        throw std::invalid_argument("Error: ConnectCheck, IP address format error (ip_addr_uint).\n");
    }
    int err = connect(sock_fd, (struct sockaddr *)&m_sockaddr, sizeof(sockaddr_in));
    close(sock_fd);
    // ret == 0 indicates a successful TCP handshake -- host is up (port is open).
    // ECONNREFUSED(111) maximum retransmission attempts reached -- host is up but not responding (closed port)
    // ETIMEDOUT(110) TCP SYN sent and retransmission attempt threshold reached -- host is up but has not responded
    // (filtered port)
    // else host is down.
    if (err == 0 || errno == ECONNREFUSED || errno == ETIMEDOUT)
    {
        return true;
    }
    else
    {
        return false;
    }
}

std::vector<std::vector<std::string>> NetScan::Scan(uint32_t ip_addr_uint_start, uint32_t ip_addr_uint_end, Mode mode)
{
    std::vector<std::vector<std::string>> avail_hosts{};
    char ip_char_buf[INET_ADDRSTRLEN] = {0};
    for (uint32_t i = ip_addr_uint_start; i < ip_addr_uint_end; i++)
    {
        bool host_found = mode == Mode::PING ? PingCheck(i) : ConnectCheck(i);
        if (host_found)
        {
            uint32_t host_num = ntohl(i);
            if (inet_ntop(AF_INET, &host_num, ip_char_buf, INET_ADDRSTRLEN) == NULL)
            {
                throw std::invalid_argument("Error: PingScan, IP address format error (host_num).\n");
            }
            std::vector<std::string> host{};
            std::string ip_addr_string{ip_char_buf};
            host.emplace_back(ip_addr_string);
            std::string hostname = GetHostname();
            host.emplace_back(hostname);

            avail_hosts.emplace_back(host);
        }
    }
    return avail_hosts;
}

std::vector<std::vector<std::string>> NetScan::CIDRScan(std::string cidr_string, size_t slash_pos, Mode mode)
{
    std::string ip_addr_string{};
    int num_prefix_bits = 32;
    SplitCIDR(cidr_string, slash_pos, ip_addr_string, num_prefix_bits);
    uint32_t start_ip_uint = IPAddrStrToUInt32(ip_addr_string.data());
    uint32_t end_ip_uint = start_ip_uint;
    DetermineIPRange(num_prefix_bits, start_ip_uint, end_ip_uint);
    if (end_ip_uint < start_ip_uint)
    {
        throw std::invalid_argument("Error: CIDRScan, end_ip_uint cannot be less than start_ip_uint.\n");
    }
    std::vector<std::vector<std::string>> avail_hosts = Scan(start_ip_uint, end_ip_uint, mode);
    return avail_hosts;
}

std::vector<std::vector<std::string>> NetScan::DetermineAndRunOperation(char *cidr_char_string, Mode mode)
{
    std::string ip_addr_or_cidr{cidr_char_string};
    size_t slash_pos = ip_addr_or_cidr.find('/');
    std::vector<std::vector<std::string>> avail_hosts{};
    if (slash_pos == std::string::npos)
    {
        std::vector<std::string> host_up = Check(ip_addr_or_cidr, mode);
        if (host_up.size() > 0)
        {
            avail_hosts.emplace_back(host_up);
        }
    }
    else
    {
        avail_hosts = CIDRScan(ip_addr_or_cidr, slash_pos, mode);
    }

    if (avail_hosts.size() > 0)
    {
        std::printf("Host(s) found:\n");
        for (auto &host : avail_hosts)
        {
            std::printf("\tIP Addr: %s,\t\thostname: %s\n", host[0].c_str(), host[1].c_str());
        }
    }

    return avail_hosts;
}
