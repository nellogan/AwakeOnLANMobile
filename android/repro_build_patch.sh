#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
GRADLE_CACHE_PREFIX="/home/$(whoami)/.gradle/caches/"

## react-native patch
# Force appmodules.so to omit unnecessary data that can interfere with reproducibility when linking
CMAKE_FILE="${PROJECT_ROOT}/node_modules/react-native/ReactAndroid/cmake-utils/default-app-setup/CMakeLists.txt"
echo "set_target_properties(appmodules PROPERTIES LINK_FLAGS \"-Wl,--build-id=none -Wl,--sort-common -Wl,--sort-section=name -Wl,--no-undefined-version -Wl,--no-rosegment -Wl,--strip-all -Wl,--hash-style=gnu\")" >> "$CMAKE_FILE"

CMAKE_FILE="${PROJECT_ROOT}/node_modules/react-native/ReactAndroid/cmake-utils/ReactNative-application.cmake"
# Compile appmodules.so with -g0 (no debug)
sed -i '/add_library(${CMAKE_PROJECT_NAME} SHARED ${input_SRC})/a target_compile_options(${CMAKE_PROJECT_NAME} PRIVATE -g0)' "$CMAKE_FILE"
# Force autolinked libraries to be compiled with -g0 and use appropriate linker flags for reproducibility
sed -i '/if(EXISTS ${PROJECT_BUILD_DIR}\/generated\/autolinking\/src\/main\/jni\/Android-autolinking.cmake)/,/endif()/c\
if(EXISTS ${PROJECT_BUILD_DIR}/generated/autolinking/src/main/jni/Android-autolinking.cmake)\
  include(${PROJECT_BUILD_DIR}/generated/autolinking/src/main/jni/Android-autolinking.cmake)\
  target_link_libraries(${CMAKE_PROJECT_NAME} ${AUTOLINKED_LIBRARIES})\
  foreach(autolinked_library ${AUTOLINKED_LIBRARIES})\
    target_compile_options(${autolinked_library} PRIVATE -g0)\
    target_link_options(${autolinked_library} PRIVATE -Wl,--build-id=none -Wl,--sort-common -Wl,--sort-section=name -Wl,--no-undefined-version -Wl,--no-rosegment -Wl,--strip-all -Wl,--hash-style=gnu)\
    target_link_libraries(${autolinked_library} common_flags)\
  endforeach()\
endif()' "$CMAKE_FILE"
# Force codegen files to be compiled with -g0 and use appropriate linker flags for reproducibility
sed -i '/if(EXISTS ${PROJECT_BUILD_DIR}\/generated\/source\/codegen\/jni\/CMakeLists.txt)/,/endif()/c\
if(EXISTS ${PROJECT_BUILD_DIR}/generated/source/codegen/jni/CMakeLists.txt)\
  add_subdirectory(${PROJECT_BUILD_DIR}/generated/source/codegen/jni/ codegen_app_build)\
  get_property(APP_CODEGEN_TARGET DIRECTORY ${PROJECT_BUILD_DIR}/generated/source/codegen/jni/ PROPERTY BUILDSYSTEM_TARGETS)\
  target_link_libraries(${CMAKE_PROJECT_NAME} ${APP_CODEGEN_TARGET})\
  foreach(codegen_target ${APP_CODEGEN_TARGET})\
    target_compile_options(${codegen_target} PRIVATE -g0)\
    target_link_options(${codegen_target} PRIVATE -Wl,--build-id=none -Wl,--sort-common -Wl,--sort-section=name -Wl,--no-undefined-version -Wl,--no-rosegment -Wl,--strip-all -Wl,--hash-style=gnu)\
    target_link_libraries(${codegen_target} common_flags)\
  endforeach()\
  string(REGEX REPLACE "react_codegen_" "" APP_CODEGEN_HEADER "${APP_CODEGEN_TARGET}")\
  target_compile_options(${CMAKE_PROJECT_NAME}\
    PRIVATE\
    -DREACT_NATIVE_APP_CODEGEN_HEADER="${APP_CODEGEN_HEADER}.h"\
    -DREACT_NATIVE_APP_COMPONENT_DESCRIPTORS_HEADER="react/renderer/components/${APP_CODEGEN_HEADER}/ComponentDescriptors.h"\
    -DREACT_NATIVE_APP_COMPONENT_REGISTRATION=${APP_CODEGEN_HEADER}_registerComponentDescriptorsFromCodegen\
    -DREACT_NATIVE_APP_MODULE_PROVIDER=${APP_CODEGEN_HEADER}_ModuleProvider\
  )\
endif()' "$CMAKE_FILE"

## react-native-screens patch
# Force rnscreens.so to omit unnecessary data that can interfere with reproducibility when linking
CMAKE_FILE="${PROJECT_ROOT}/node_modules/react-native-screens/android/CMakeLists.txt"
echo "set_target_properties(rnscreens PROPERTIES LINK_FLAGS \"-Wl,--build-id=none -Wl,--sort-common -Wl,--sort-section=name -Wl,--no-rosegment -Wl,--strip-all -Wl,--hash-style=gnu\")" >> "$CMAKE_FILE"

CMAKE_FILE="${PROJECT_ROOT}/node_modules/react-native-screens/android/src/main/jni/CMakeLists.txt"
# Rewrite paths starting with ${PROJECT_ROOT} (the project’s root directory, obtained via pwd) to /project
# -ffile-prefix-map: Rewrites file paths embedded in object files, such as those used in debug information or certain compiler-generated data
# Even with -g0 (which disables debug info), some paths can still appear in the binary (e.g., in .rodata via __FILE__ expansion in assertions or logging)
# Rewrite paths starting with ${GRADLE_CACHE_PREFIX} (defined as /home/${USER}/.gradle/caches/) to /project/caches/
# -fmacro-prefix-map: Specifically rewrites paths used in macro expansions, such as __FILE__ in C/C++ code
sed -i '/cmake_minimum_required(VERSION 3.13)/a \
set(CMAKE_EXPORT_COMPILE_COMMANDS ON) \
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -ffile-prefix-map='"${PROJECT_ROOT}"'=/project -fmacro-prefix-map='"${PROJECT_ROOT}"'=/project -ffile-prefix-map='"${GRADLE_CACHE_PREFIX}"'=/project/caches/ -fmacro-prefix-map='"${GRADLE_CACHE_PREFIX}"'=/project/caches/") \
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -ffile-prefix-map='"${PROJECT_ROOT}"'=/project -fmacro-prefix-map='"${PROJECT_ROOT}"'=/project -ffile-prefix-map='"${GRADLE_CACHE_PREFIX}"'=/project/caches/ -fmacro-prefix-map='"${GRADLE_CACHE_PREFIX}"'=/project/caches/")' "$CMAKE_FILE"
## safe-area-context patch
CMAKE_FILE="${PROJECT_ROOT}/node_modules/react-native-safe-area-context/android/src/main/jni/CMakeLists.txt"
sed -i '/cmake_minimum_required(VERSION 3.13)/a \
set(CMAKE_EXPORT_COMPILE_COMMANDS ON) \
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -ffile-prefix-map=${CMAKE_SOURCE_DIR}=/project -fmacro-prefix-map=${CMAKE_SOURCE_DIR}=/project -ffile-prefix-map='"${GRADLE_CACHE_PREFIX}"'=/project/caches/ -fmacro-prefix-map='"${GRADLE_CACHE_PREFIX}"'=/project/caches/") \
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -ffile-prefix-map=${CMAKE_SOURCE_DIR}=/project -fmacro-prefix-map=${CMAKE_SOURCE_DIR}=/project -ffile-prefix-map='"${GRADLE_CACHE_PREFIX}"'=/project/caches/ -fmacro-prefix-map='"${GRADLE_CACHE_PREFIX}"'=/project/caches/")' "$CMAKE_FILE"
