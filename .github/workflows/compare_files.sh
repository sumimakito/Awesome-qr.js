#!/bin/bash

set -eo pipefail

diff ./src/tests/qrTestsOld/test7.png ./src/tests/qrTests/test7.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/defualt-test5.png ./src/tests/qrTests/defualt-test5.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/defualt-test7.png ./src/tests/qrTests/defualt-test7.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/default-svg2.svg ./src/tests/qrTests/default-svg2.svg
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/test8.png ./src/tests/qrTests/test8.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/circular_png_no_logo_background.png ./src/tests/qrTests/circular_png_no_logo_background.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/defualt-test8.png ./src/tests/qrTests/defualt-test8.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/frame-plus-square.png ./src/tests/qrTests/frame-plus-square.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/default-svg5.svg ./src/tests/qrTests/default-svg5.svg
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/defualt-test3.png ./src/tests/qrTests/defualt-test3.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/default.svg ./src/tests/qrTests/default.svg
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/circular-square.png ./src/tests/qrTests/circular-square.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/circular-sqaure.svg ./src/tests/qrTests/circular-sqaure.svg
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/circular-rightdiamond.svg ./src/tests/qrTests/circular-rightdiamond.svg
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/defualt-test.png ./src/tests/qrTests/defualt-test.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/frame-plus-square-vcard.png ./src/tests/qrTests/frame-plus-square-vcard.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/defualt-test2.png ./src/tests/qrTests/defualt-test2.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/frame-plus-square-vcard.svg ./src/tests/qrTests/frame-plus-square-vcard.svg
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/frame-plus-square.svg ./src/tests/qrTests/frame-plus-square.svg
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/test6.png ./src/tests/qrTests/test6.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/circular-circle.svg ./src/tests/qrTests/circular-circle.svg
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/circular-leftdiamond.png ./src/tests/qrTests/circular-leftdiamond.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/circular-kite.png ./src/tests/qrTests/circular-kite.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/default-svg4.svg ./src/tests/qrTests/default-svg4.svg
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/test5.png ./src/tests/qrTests/test5.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/logo_no_background.svg ./src/tests/qrTests/logo_no_background.svg
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/default_circular.svg ./src/tests/qrTests/default_circular.svg
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/circular_vcard.svg ./src/tests/qrTests/circular_vcard.svg
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/test2.png ./src/tests/qrTests/test2.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/circular-leftdiamond.svg ./src/tests/qrTests/circular-leftdiamond.svg
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/test3.png ./src/tests/qrTests/test3.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/circular_default.png ./src/tests/qrTests/circular_default.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/defualt-test6.png ./src/tests/qrTests/defualt-test6.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/default_vcard.svg ./src/tests/qrTests/default_vcard.svg
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/circular-rightdiamond.png ./src/tests/qrTests/circular-rightdiamond.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/circular_vcard.png ./src/tests/qrTests/circular_vcard.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/default_vcard.png ./src/tests/qrTests/default_vcard.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/circular-circle.png ./src/tests/qrTests/circular-circle.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/test.png ./src/tests/qrTests/test.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/default-svg3.svg ./src/tests/qrTests/default-svg3.svg
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/default.png ./src/tests/qrTests/default.png
if [ $? -ne 0 ]; then
    exit 1
fi


diff ./src/tests/qrTestsOld/circular-kite.svg ./src/tests/qrTests/circular-kite.svg
if [ $? -ne 0 ]; then
    exit 1
fi
