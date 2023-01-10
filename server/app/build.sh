#!/bin/bash

lein clean
lein uberjar
cp target/boca.jar ../bin/
