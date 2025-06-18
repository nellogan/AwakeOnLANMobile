#include "NativeModule.h"

namespace facebook::react
{

// Helper function to convert std::vector<std::string> to jsi::Array
jsi::Array VectorToJsiArray(jsi::Runtime &rt, const std::vector<std::string> &vec)
{
    jsi::Array arr = jsi::Array(rt, vec.size());
    for (size_t i = 0; i < vec.size(); ++i)
    {
        arr.setValueAtIndex(rt, i, jsi::String::createFromUtf8(rt, vec[i]));
    }
    return arr;
}

// Helper function to convert std::vector<std::vector<std::string>> to jsi::Array of jsi::Array
jsi::Array NestedVectorToJsiArray(jsi::Runtime &rt, const std::vector<std::vector<std::string>> &nestedVec)
{
    jsi::Array outerArr = jsi::Array(rt, nestedVec.size());
    for (size_t i = 0; i < nestedVec.size(); ++i)
    {
        jsi::Array innerArr = VectorToJsiArray(rt, nestedVec[i]);
        outerArr.setValueAtIndex(rt, i, innerArr);
    }
    return outerArr;
}

NativeModule::NativeModule(std::shared_ptr<CallInvoker> jsInvoker) : NativeModuleCxxSpec(std::move(jsInvoker))
{
}

bool NativeModule::ValidMac(jsi::Runtime &rt, std::string input)
{
    return ValidateMACAddr(const_cast<char *>(input.c_str()));
}

bool NativeModule::ValidIp(jsi::Runtime &rt, std::string input)
{
    int valid = DetermineIPVersion(input.c_str());

    return valid == 4 || valid == 6;
}

void NativeModule::SendWOL(jsi::Runtime &rt, std::string mac_addr, std::string ip_addr, std::string port,
                           std::string passwd)
{
    // Note the order of arguments is different
    AWakeOnLAN a_wake_on_lan{ip_addr.length() ? const_cast<char *>(ip_addr.c_str()) : nullptr,
                             port.length() ? const_cast<char *>(port.c_str()) : nullptr,
                             mac_addr.length() ? const_cast<char *>(mac_addr.c_str()) : nullptr,
                             passwd.length() ? const_cast<char *>(passwd.c_str()) : nullptr, false};

    a_wake_on_lan.SendMagicPacket();
}

jsi::Value NativeModule::ScanHosts(jsi::Runtime &rt, std::string input, std::string mode_selected)
{
    Mode mode = mode_selected == "Ping" ? Mode::PING : Mode::CONNECT;

    jsi::Function promise_constructor = rt.global().getPropertyAsFunction(rt, "Promise");
    jsi::PropNameID promise_propnameid = jsi::PropNameID::forAscii(rt, "Promise");

    jsi::HostFunctionType host_promise = [=, this](jsi::Runtime &rt, const jsi::Value &thisValue,
                                                   const jsi::Value *args, size_t count) -> jsi::Value {
        std::shared_ptr<jsi::Value> resolve = std::make_shared<jsi::Value>(rt, args[0]);
        std::shared_ptr<jsi::Value> reject = std::make_shared<jsi::Value>(rt, args[1]);

        std::thread([&rt, jsInvoker = jsInvoker_, resolve, reject, input, mode]() {
            try
            {
                NetScan net_scan{};
                std::vector<std::vector<std::string>> avail_hosts =
                    net_scan.DetermineAndRunOperation(const_cast<char *>(input.c_str()), mode);
                // If any errors are encountered they will be caught via catch and its error message sent as a
                // rejection. On the Javascript side, the rejection will also be caught via catch
                jsInvoker->invokeAsync([&rt, resolve, arr = std::move(avail_hosts)]() {
                    jsi::Array js_array = NestedVectorToJsiArray(rt, arr);
                    resolve->asObject(rt).asFunction(rt).call(rt, js_array);
                });
            }
            catch (const std::runtime_error &err)
            {
                std::string err_string{err.what()};
                jsInvoker->invokeAsync([&rt, reject, e = std::move(err_string)]() {
                    reject->asObject(rt).asFunction(rt).call(rt, jsi::String::createFromUtf8(rt, e));
                });
            }
            catch (const std::invalid_argument &err)
            {
                std::string err_string{err.what()};
                jsInvoker->invokeAsync([&rt, reject, e = std::move(err_string)]() {
                    reject->asObject(rt).asFunction(rt).call(rt, jsi::String::createFromUtf8(rt, e));
                });
            }
        }).detach();

        return {};
    };

    jsi::Function js_promise_func = jsi::Function::createFromHostFunction(rt, promise_propnameid, 0, host_promise);
    return promise_constructor.callAsConstructor(rt, js_promise_func);
};

} // namespace facebook::react
