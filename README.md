# TOCjs - A JavaScript Generator of a Table of Contents from an HTML Document
This tool crawles an HTML source code for heading tags and creates structured table of contents using either sorted or unsorted lists.

It uses JavaScript with jQuery for the processing of the document and HTML with CSS for the tool's frontend. Everything is pulled locally, no Internet connection is required for the tool to work.

Insert an HTML source code of your document into the Input textarea below and click the button Generate TOC. This generates nested ordered lists of the headings found in the document. The items in the lists are links to the headings. These links use IDs of the headings (called anchors). Those are either added to each heading tag if there was no ID before; the existing IDs are used as is.

Please note the IDs are generated from the content of the headings so there must not be two identical headings for the anchors to work correctly.

In the Output section, you will find the generated TOC rendered as HTML as well as inserted into the textarea as an HTML source. In the textarea below, you'll find your document with the TOC and corresponding IDs added to the document (if there were any heading tags missing the ID attribute).

In the section Options, you can choose which type of lists you would like the tool to use and you can set a string to be prepended before the IDs of the headings. This can be, for example, a URL of the page in case you want to use the TOC in some other page.

To use the output of this tool, copy the source code of your document with the heading IDs back to where you use your document, or just add the source of the generated TOC to your document in case you had all the IDs in the document already. You can also copy the TOC to the document with the IDs from the visual output if you have a WYSIWYG editor.
