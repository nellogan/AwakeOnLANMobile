# Format .cpp and .h files using clang-format
clang-format -i $PWD/cpp/*

# Format Javascript and Typescript using prettier
npx prettier --write "$PWD/src/**/*.{js,jsx,ts,tsx}"
npx prettier --write "$PWD/specs/*.{js,jsx,ts,tsx}"

# Format README.md using prettier
npx prettier --write "$PWD/README.md"