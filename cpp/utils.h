#ifndef UTILS_H
#define UTILS_H

#include <arpa/inet.h>
#include <cstdint>
#include <ifaddrs.h>
#include <net/if.h>
#include <netinet/in.h>
#include <string>
#include <sys/ioctl.h>
#include <sys/socket.h>
#include <system_error>
#include <unistd.h>
#include <vector>

// Android blocks sending to both 255.255.255.255 and to the local subnets broadcast addr (e.g. 192.168.1.255)
// therefore these two functions are not useful
// int IsWifiInterface(const char *ifname);
//
// int GetBroadcastAddr(char *broadcast_addr);

int DetermineIPVersion(const char *src);

bool ValidateMACAddr(char *mac_addr_str);

void SanitizeMACAddr(char *mac_addr_str);

uint8_t HexDigitToUint8(char str);

void HexStringToBytesVec(std::string &ascii_string, std::vector<uint8_t> &bytes_vec);

#endif