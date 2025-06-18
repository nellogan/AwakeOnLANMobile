#include "a_wake_on_lan.h"

#define MAC_ADDR_BYTE_SZ 6
// #define DEFAULT_IPV4_BCAST "255.255.255.255"
#define DEFAULT_IPV4_BCAST "192.255.255.255" // Android restricts sending broadcasts to 255.255.255.255
#define DEFAULT_IPV6_MCAST "ff02::1"

AWakeOnLAN::AWakeOnLAN(char *ip_addr_arg, char *port_arg, char *mac_arg, char *passwd_arg, bool ipv6_toggle)
{
    SetIPAddr(ip_addr_arg, ipv6_toggle);
    SetPort(port_arg);
    SetMac(mac_arg);
    ConfigSocketSettings();
    if (passwd_arg)
    {
        SetPasswd(passwd_arg);
    }
    CreateMagicPacket();
}

AWakeOnLAN::~AWakeOnLAN()
{
    if (socket_fd > 0)
    {
        close(socket_fd);
    }
}

void AWakeOnLAN::SetIPAddr(char *ip_addr_arg, bool ipv6_toggle_val)
{
    if (ip_addr_arg == nullptr)
    {
        ip_addr = ipv6_toggle_val ? DEFAULT_IPV6_MCAST : DEFAULT_IPV4_BCAST;
        ////        if (ipv6_toggle_val)
        ////        {
        ////            ip_addr = ipv6_toggle_val ? DEFAULT_IPV6_MCAST : ;
        ////        }
        ////        char broadcast_addr[INET_ADDRSTRLEN] = {0};
        ////        if (GetBroadcastAddr(broadcast_addr) == -1) {
        ////            ip_addr = DEFAULT_IPV4_BCAST;
        ////       } else {
        ////            ip_addr = broadcast_addr;
        ////        }
        ////        ip_addr = DEFAULT_IPV4_BCAST;
    }
    else
    {
        int ip_version = DetermineIPVersion(ip_addr_arg);
        if (ip_version == -1)
        {
            throw std::invalid_argument("Error: AWakeOnLAN::SetIPAddr, invalid IP Address.");
        }
        ipv6_toggle_val = ip_version == 4 ? false : true;
        ip_addr = ip_addr_arg;
    }
    domain = ipv6_toggle_val ? AF_INET6 : AF_INET;
}

void AWakeOnLAN::ConfigSocketSettings()
{
    socket_fd = socket(domain, SOCK_DGRAM, IPPROTO_UDP);
    if (socket_fd < 0)
    {
        std::error_code ec(errno, std::system_category());
        throw std::system_error(ec, "Error: AWakeOnLAN::ConfigSocketSettings, could not create socket.\n");
    }

    if (domain == AF_INET)
    {
        int broadcast_enable = 1;
        if (setsockopt(socket_fd, SOL_SOCKET, SO_BROADCAST, &broadcast_enable, sizeof(broadcast_enable)) < 0)
        {
            close(socket_fd);
            std::error_code ec(errno, std::system_category());
            throw std::system_error(ec, "Error: AWakeOnLAN::ConfigSocketSettings, could set SO_BROADCAST to socket.\n");
        }
        server_address.sin_family = domain;
        server_address.sin_port = htons(port);
        server_address.sin_addr.s_addr = inet_addr(ip_addr.c_str());
    }
    else
    {
        std::memset(&server_address_v6, 0, sizeof(struct sockaddr_in6));
        server_address_v6.sin6_family = domain;
        server_address_v6.sin6_port = htons(port);
        inet_pton(domain, ip_addr.c_str(), &server_address_v6.sin6_addr);
    }
}

void AWakeOnLAN::SetPort(char *port_arg)
{
    if (port_arg == nullptr)
    {
        port = DEFAULT_PORT;
    }
    else
    {
        port = static_cast<int>(std::stol(port_arg));
    }

    if (port <= 0 || port > 65535)
    {
        throw std::invalid_argument("Error: AWakeOnLAN::SetPort, port must be greater than 0 and less than or "
                                    "equal to 65535.");
        ;
    }
}

void AWakeOnLAN::SetMac(char *mac_arg)
{
    if (!ValidateMACAddr(mac_arg))
    {
        throw std::invalid_argument(
            "Error: AWakeOnLAN::SetMac, MAC Address must be 6 bytes long and formatted such that "
            "1. no spaces between hex bytes, or 2. colons ':' between hex bytes, or "
            "3. hyphens '-' between hex bytes.");
    }
    if (*(mac_arg + 2) == ':' || *(mac_arg + 2) == '-')
    {
        SanitizeMACAddr(mac_arg);
    }
    std::string mac_string = mac_arg;

    HexStringToBytesVec(mac_string, mac);
}

void AWakeOnLAN::SetPasswd(char *passwd_arg)
{
    int passwd_len = static_cast<int>(std::strlen(passwd_arg));
    passwd.assign(passwd_arg, passwd_arg + passwd_len);
}

void AWakeOnLAN::CreateMagicPacket()
{
    magic_packet.assign(MAC_ADDR_BYTE_SZ, 255);
    for (int i = 0; i < 16; i++)
    {
        magic_packet.insert(magic_packet.end(), mac.begin(), mac.end());
    }
    if (passwd.size() > 0)
    {
        magic_packet.insert(magic_packet.end(), passwd.begin(), passwd.end());
    }
}

void AWakeOnLAN::SendMagicPacket()
{
    int send_err_code = 0;
    if (domain == AF_INET)
    {
        send_err_code = sendto(socket_fd, magic_packet.data(), magic_packet.size(), 0,
                               (struct sockaddr *)&server_address, sizeof(server_address));
    }
    else
    {
        send_err_code = sendto(socket_fd, magic_packet.data(), magic_packet.size(), 0,
                               (struct sockaddr *)&server_address_v6, sizeof(sockaddr_in6));
    }

    if (send_err_code < 0)
    {
        close(socket_fd);
        std::error_code ec(errno, std::system_category());
        throw std::system_error(ec, "Error: AWakeOnLAN::SendMagicPacket, failed to send message.\n");
    }
}
