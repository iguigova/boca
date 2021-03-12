#!/bin/bash

lein clean
lein uberjar
cp target/icebreaker.jar ../bin/
