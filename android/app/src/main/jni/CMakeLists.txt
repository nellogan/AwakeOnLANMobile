cmake_minimum_required(VERSION 3.13)

# Define the library name here.
project(appmodules)

# This file includes all the necessary to let you build your React Native application
include(${REACT_ANDROID_DIR}/cmake-utils/ReactNative-application.cmake)

# Define where the additional source code lives. We need to crawl back the jni, main, src, app, android folders
target_sources(${CMAKE_PROJECT_NAME} PRIVATE ../../../../../cpp/NativeModule.cpp)
target_sources(${CMAKE_PROJECT_NAME} PRIVATE ../../../../../cpp/net_scan.cpp)
target_sources(${CMAKE_PROJECT_NAME} PRIVATE ../../../../../cpp/a_wake_on_lan.cpp)
target_sources(${CMAKE_PROJECT_NAME} PRIVATE ../../../../../cpp/utils.cpp)

# Define where CMake can find the additional header files. We need to crawl back the jni, main, src, app, android folders
target_include_directories(${CMAKE_PROJECT_NAME} PUBLIC ../../../../../cpp)


# Uncomment these two lines if __android_log_print(ANDROID_LOG_INFO, "TAG", "Comment") is needed
# Find the Android log library
#find_library(log-lib log)
#
# Link the log library and other required libraries
#target_link_libraries(${CMAKE_PROJECT_NAME}
#        ${log-lib}
#)
