#!/bin/bash

set -eo pipefail

diff ./src/tests/qrTestsOld/default.png ./src/tests/qrTests/default.png
if [ $? -ne 0 ]; then
    exit 1
fi

diff ./src/tests/qrTestsOld/default.svg ./src/tests/qrTests/default.svg
if [ $? -ne 0 ]; then
    exit 1
fi

diff ./src/tests/qrTestsOld/default_vcard.png ./src/tests/qrTests/default_vcard.png
if [ $? -ne 0 ]; then
    exit 1
fi

diff ./src/tests/qrTestsOld/default_vcard.svg ./src/tests/qrTests/default_vcard.svg
if [ $? -ne 0 ]; then
    exit 1
fi
