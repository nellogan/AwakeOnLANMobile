#include "utils.h"

//// Function to check if an interface is likely a Wi-Fi interface
// int IsWifiInterface(const char *ifname)
//{
//     // Common Wi-Fi interface name prefixes, probably do not need eth* as that is normally for wired connections
//     // iPhone uses (?) enX normally for WiFi but can use for cellular (?) todo verify
//     const char *wifi_prefixes[] = {"wlan", "wifi", "en", "eth"};
//     for (size_t i = 0; i < sizeof(wifi_prefixes) / sizeof(wifi_prefixes[0]); i++) {
//         if (strncmp(ifname, wifi_prefixes[i], strlen(wifi_prefixes[i])) == 0) {
//             return 1;
//         }
//     }
//     // Explicitly exclude known cellular interface prefixes
//     // Android rmnet and ccmni
//     // iPhone pdp_ip
//     const char *cellular_prefixes[] = {"wwan", "rmnet", "ccmni", "pdp_ip"};
//     for (size_t i = 0; i < sizeof(cellular_prefixes) / sizeof(cellular_prefixes[0]); i++) {
//         if (strncmp(ifname, cellular_prefixes[i], strlen(cellular_prefixes[i])) == 0) {
//             return 0;
//         }
//     }
//     // If no clear match, assume it's not Wi-Fi to be safe
//     return 0;
// }
//
//// Function to fill broadcast_addr with the broadcast address of the first valid Wi-Fi interface
//// Returns 0 on success, -1 on failure
// int GetBroadcastAddr(char *broadcast_addr)
//{
//     struct ifaddrs *ifaddr, *ifa;
//     int sock;
//
//     // Get list of network interfaces
//     if (getifaddrs(&ifaddr) == -1) {
//         perror("getifaddrs");
//         return -1;
//     }
//
//     // Create a socket for ioctl
//     sock = socket(AF_INET, SOCK_DGRAM, 0);
//     if (sock < 0) {
//         perror("socket");
//         freeifaddrs(ifaddr);
//         return -1;
//     }
//
//     // Iterate through interfaces
//     for (ifa = ifaddr; ifa != NULL; ifa = ifa->ifa_next) {
//
//         if (ifa->ifa_addr == NULL || ifa->ifa_addr->sa_family != AF_INET)
//             continue;
//
//         // Check if the interface is likely a Wi-Fi interface
//         if (!IsWifiInterface(ifa->ifa_name))
//             continue;
//
//         // Check if interface is up and supports broadcasting
//         struct ifreq ifr;
//         strncpy(ifr.ifr_name, ifa->ifa_name, IFNAMSIZ - 1);
//         ifr.ifr_name[IFNAMSIZ - 1] = '\0'; // Ensure null-termination
//         if (ioctl(sock, SIOCGIFFLAGS, &ifr) < 0) {
//             perror("ioctl SIOCGIFFLAGS");
//             continue;
//         }
//         if (!(ifr.ifr_flags & IFF_UP) || (ifr.ifr_flags & IFF_LOOPBACK) || !(ifr.ifr_flags & IFF_BROADCAST))
//             continue; // Skip if down, loopback, or doesn't support broadcasting
//
//         // Get IP address and subnet mask
//         struct sockaddr_in *ipaddr = (struct sockaddr_in *)ifa->ifa_addr;
//         struct sockaddr_in *netmask = (struct sockaddr_in *)ifa->ifa_netmask;
//
//         // Calculate broadcast address
//         struct sockaddr_in broadcast;
//         broadcast.sin_family = AF_INET;
//         broadcast.sin_addr.s_addr = ipaddr->sin_addr.s_addr | ~netmask->sin_addr.s_addr;
//
//         // Convert to string and store in broadcast_addr
//         if (inet_ntop(AF_INET, &broadcast.sin_addr, broadcast_addr, INET_ADDRSTRLEN) == NULL) {
//             perror("inet_ntop");
//             close(sock);
//             freeifaddrs(ifaddr);
//             return -1;
//         }
//
//         // Success: close resources and return
//         close(sock);
//         freeifaddrs(ifaddr);
//         return 0;
//     }
//
//     // No valid Wi-Fi interfaces found
//     close(sock);
//     freeifaddrs(ifaddr);
//     return -1;
// }

int DetermineIPVersion(const char *src)
{
    char buf[INET6_ADDRSTRLEN];
    if (inet_pton(AF_INET, src, buf))
    {
        return 4;
    }
    else if (inet_pton(AF_INET6, src, buf))
    {
        return 6;
    }
    return -1;
}

bool ValidateMACAddr(char *mac_addr_str)
{
    int i = 0;
    int s = 0;
    // Make sure mac_addr_str is null terminated.
    while (*mac_addr_str)
    {
        if (isxdigit(*mac_addr_str))
        {
            i++;
        }
        else if (*mac_addr_str == ':' || *mac_addr_str == '-')
        {
            if (i == 0 || (i / 2 - 1) != s)
            {
                break;
            }
            s++;
        }
        else
        {
            s--;
        }
        ++mac_addr_str;
    }
    return (i == 12 && ((s == 5) || (s == 0)));
}

// Use after ValidateMACAddr if (*mac_addr_str+2 == ':' ||  *mac_addr_str+2 == '-').
void SanitizeMACAddr(char *mac_addr_str)
{
    mac_addr_str += 2;
    char *fast_ptr = mac_addr_str + 1;
    for (int j = 0; j < 5; j++)
    {
        *mac_addr_str++ = *fast_ptr++;
        *mac_addr_str++ = *fast_ptr++;
        fast_ptr++;
    }
    *mac_addr_str = '\0';
}

uint8_t HexDigitToUint8(char str)
{
    if (str <= '9' && str >= '0')
    {
        return str - '0';
    }
    if (str <= 'F' && str >= 'A')
    {
        return str - 'A' + 10;
    }
    if (str <= 'f' && str >= 'a')
    {
        return str - 'a' + 10;
    }
    throw std::invalid_argument("HexDigitToUint8: Invalid hex character\n");
}

void HexStringToBytesVec(std::string &ascii_string, std::vector<uint8_t> &bytes_vec)
{
    int num_bytes = static_cast<int>(ascii_string.length());
    for (int i = 0; i < num_bytes; i += 2)
    {
        uint8_t upper = HexDigitToUint8(ascii_string.at(i));
        uint8_t lower = HexDigitToUint8(ascii_string.at(i + 1));
        uint8_t byte = (upper << 4) | lower;
        bytes_vec.push_back(byte);
    }
}
