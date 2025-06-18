#ifndef NET_SCAN_H
#define NET_SCAN_H

#include <cstdint>
#include <cstdio>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

#include <arpa/inet.h>
#include <netdb.h>
#include <string.h>
#include <unistd.h>

uint32_t IPAddrStrToUInt32(const char *ip_addr_str);

void SplitCIDR(std::string &cidr_string, size_t slash_pos, std::string &ip_addr_string, int &num_prefix_bits);

// Used with NetScan::CIDRScan() -> 127.3.59.1/15 should be start: 127.0.0.0, end: 127.3.255.255. Here start_ip_uint
// shall be passed as the ntohl() 127.0.0.0 uint form.
void DetermineIPRange(int num_prefix_bits, uint32_t &start_ip_uint, uint32_t &end_ip_uint);

int SpawnConnCheckSocket();

enum class Mode
{
    CONNECT = 0,
    PING = 1
};

class NetScan
{
  private:
    struct sockaddr_in m_sockaddr;
    int sock_fd;

  public:
    explicit NetScan();

    ~NetScan();

    // For checking one off IP address strings.
    std::vector<std::string> Check(std::string ip_addr, Mode mode);

    std::string GetHostname();

    bool PingCheck(uint32_t ip_addr_uint);

    // Attempts to connect to port 443 (HTTPS). Will not send retransmission attempts if first TCP SYN packet is not
    // successful.
    bool ConnectCheck(uint32_t ip_addr_uint);

    std::vector<std::vector<std::string>> Scan(uint32_t ip_addr_uint_start, uint32_t ip_addr_uint_end, Mode mode);

    std::vector<std::vector<std::string>> CIDRScan(std::string cidr_string, size_t slash_pos, Mode mode);

    std::vector<std::vector<std::string>> DetermineAndRunOperation(char *cidr_char_string, Mode mode);
};

#endif
