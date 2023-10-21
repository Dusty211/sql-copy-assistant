## SQL Copy Assistant

SQL Copy Assistant is currently some boilerplate code that gives you everything you need, besides supplying a JavaScript data mapping function for each file you would like to write, to do complex processing on a large data structure line by line from a massive input file and then write that to one or more output files. It will use those JS functions to map the input data structure, and then it will output to files which can be given to a SQL client and loaded into a database using a `COPY FROM` or `\copy` command (currently only tested with psql CLI).

### Supported Input

Currently, this only supports input files with the .ndjson extension.

### Output File

Currently, the contents of the output file is purely dependent on how you implement the data processing functions. I personlly use it to create standard tab delimited text files where each row ends with a `\n` character and SQL nulls are represented by `\N`. In my case, psql CLI consumes the created files using a `\copy` command where it sees the files as a PostgreSQL `TEXT` type input file for `COPY FROM`, but there is no reason why you couldn't use it for something else.

### Will Clean SQL-Offending Characters from Text

Included is a helper function `toSqlSafeText()` which can be used within your data mapping functions and is convenient for programmatically stripping characters from data that would normally cause issues when doing a SQL `COPY FROM`.

### Uses html-to-text Library to parse text from HTML

If some of your data has HTML which you want to extract plain-ish text from, included is a helper function `convertHtml()` which uses the html-to-text library: <https://github.com/html-to-text/node-html-to-text>

### Batched File Writes

Rather than calling `appendFile()` every iteration, you can set how many input lines will be processed before the code writes to the output files on disk. This could definitely be further optimized for performance, but right now I just wanted to avoid either writing to disk every single iteration, or exceeding size limitations on `String` or `Array` types in JavaScript because this is intended to process massive files. An improvement would be code to tell the program how to write to disk asyncronously while it continues to iterate through and perform processing on the input file at the same time. Currently the operation to write the batch to disk blocks the rest of the program from continuing until `Promise.all([...appendFile()])` resolves all of its `Promise`s.

## Why I created this?

I was playing around with some AI model fine tuning using the Python transformers library, and I wanted to use some datasets that I found which were not from HuggingFace, but these were massive files. I wanted to be able to change the structure and filter the data within these massive datasets so that I could easily present it in different ways optimized for fine tuning an AI model. I decided that a good intermediate step would be to get all the data into a SQL database so that I can easily get the data how I want it for presentation to the AI fine tuning. I also have been wanting to do a personal project just for fun, so before I even looked for something that would do this for me, I just decided it would be cool to code it out myself, and maybe I would learn things along the way. It became both fun and interesting, and I'm glad I did it.

### Future plans

I want to bring in a JavaScript PostgreSQL library to integrate directly with the database.

## Installation

Add installation instructions

## Usage

Add usage instructions
