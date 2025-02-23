#!/bin/bash
export TBBROOT="/Users/runner/work/prophet/prophet/python/build/lib.macosx-11.0-arm64-cpython-39/prophet/stan_model/cmdstan-2.33.1/stan/lib/stan_math/lib/tbb_2020.3" #
tbb_bin="/Users/runner/work/prophet/prophet/python/build/lib.macosx-11.0-arm64-cpython-39/prophet/stan_model/cmdstan-2.33.1/stan/lib/stan_math/lib/tbb" #
if [ -z "$CPATH" ]; then #
    export CPATH="${TBBROOT}/include" #
else #
    export CPATH="${TBBROOT}/include:$CPATH" #
fi #
if [ -z "$LIBRARY_PATH" ]; then #
    export LIBRARY_PATH="${tbb_bin}" #
else #
    export LIBRARY_PATH="${tbb_bin}:$LIBRARY_PATH" #
fi #
if [ -z "$DYLD_LIBRARY_PATH" ]; then #
    export DYLD_LIBRARY_PATH="${tbb_bin}" #
else #
    export DYLD_LIBRARY_PATH="${tbb_bin}:$DYLD_LIBRARY_PATH" #
fi #
 #
