#pragma once

#include <AppSpecsJSI.h>
#include <ReactCommon/CallInvoker.h>
#include <jsi/jsi.h>

#include <chrono>
#include <memory>
#include <string>
#include <thread>
#include <vector>

#include "a_wake_on_lan.h"
#include "net_scan.h"
#include "utils.h"

namespace facebook::react
{

jsi::Array VectorToJsiArray(jsi::Runtime &rt, const std::vector<std::string> &vec);
jsi::Array NestedVectorToJsiArray(jsi::Runtime &rt, const std::vector<std::vector<std::string>> &nestedVec);

class NativeModule : public NativeModuleCxxSpec<NativeModule>
{
  public:
    NativeModule(std::shared_ptr<CallInvoker> jsInvoker);

    bool ValidMac(jsi::Runtime &rt, std::string input);

    bool ValidIp(jsi::Runtime &rt, std::string input);

    void SendWOL(jsi::Runtime &rt, std::string mac_addr, std::string ip_addr, std::string port, std::string passwd);

    jsi::Value ScanHosts(jsi::Runtime &rt, std::string input, std::string mode_selected);
};

} // namespace facebook::react
