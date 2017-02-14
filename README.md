# dawson-snippets
![](https://nodei.co/npm/dawson-snippets.png?mini=true)  

[dawson](https://github.com/dawson-org/dawson-cli)-ready CloudFormation Template Snippets.
Snippets are an easy way to add custom resources to a [dawson](https://github.com/dawson-org/dawson-cli) application.

[![npm version](https://badge.fury.io/js/dawson-snippets.svg)](https://badge.fury.io/js/dawson-snippets)
[![Build Status](https://travis-ci.org/dawson-org/dawson-snippets.svg?branch=master)](https://travis-ci.org/dawson-org/dawson-snippets)


## Usage

For usage instructions see the README files in each folder.

Snippets are composable and are designed to be merged using `lodash.merge` or any similar deep-merge function. Snippets provides `Resources` objects that you can attach to a `dawson` application using [processCFTemplate() or customTemplateFragment()](https://github.com/dawson-org/dawson-cli/blob/master/docs/README.md#6-working-with-the-template).

`dawson-snippets` is dependency-free; it should be used with the `dawson` package of the same version (major.minor).


### Resource Names

Many snippets will take one or many `logicalName` parameter(s). Each `*LogicalName` you provide must be **unique** in a whole `CloudFormation Template`.    
Resources Physical Names will be created automatically by `CloudFormation`.
Resources Physical (real) Names and ARNs should be accessed using `Ref`, `Fn::Sub`, `Fn::GetAtt` functions and shall never be hardcoded into your apps.


## License

Copyright 2017 Simone Lusenti <lusenti.s@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
