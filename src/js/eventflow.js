// config
var UPLOADCARE_PUBLIC_KEY = "8b5b4f0679e1d28fcb7e";
var ref = new Firebase("https://scorching-fire-2873.firebaseio.com");

// feed
var feed = (function($, uc, undefined)
{
    var options = {
        feedRef: null,
        feedContainer: null
    };

    // config
    var config = function(o)
    {
        $.extend(options, o);

        options.feedRef.on("child_added", childAdded);
    };

    // push
    var push = function(data, type)
    {
        if (options.feedRef != null)
        {
            options.feedRef.push({data: data, type: type, timestamp: Firebase.ServerValue.TIMESTAMP});
        }
    };

    // push - text
    var pushText = function(text)
    {
        if (text.length > 0)
        {
            push(text, "text");
        }
    };

    // push - image
    var pushImage = function(file)
    {
        var file = uc.fileFrom("object", file);
        file.done(function(file)
        {
            if (file.isImage)
            {
                push(file.originalUrl, "image");
            }
        }).progress(function(upload)
        {
            console.log(upload.progress);
        });
    };

    // update feed
    var childAdded = function(snapshot, prev)
    {
        id   = snapshot.key();
        data = snapshot.val();

        item = $("<div></div>");
        switch(data.type)
        {
            case "image":
                $("<img>", {alt: "image" + id, src: data.data}).appendTo(item);
                break;
            case "text":
                $("<p></p>").text(data.data).appendTo(item);
                break;
        }

        options.feedContainer.prepend(item);
    };


    // return
    return {
        config:     config,
        pushText:   pushText,
        pushImage:  pushImage
    };
})(jQuery, uploadcare);

// on ready
$(function()
{
    feed.config({feedRef: ref.child("feed"), feedContainer: $("#feed")});

    // load options
    ref.child("options").on("value", function(options)
    {
        options = options.val();

        // set title and meta data
        $("head title").html(options.title);
        $("head meta[name=description]").attr("content", options.description);
        $("head meta[name=keywords]").attr("content", options.keywords);
        $("head meta[name=author]").attr("content", options.author);
    }, function(e)
    {
        console.error(e.code);
    });

    // post event - text
    $("#post-text form").submit(function()
    {
        var textBox = $("input[type=text]", this);
        feed.pushText(textBox.val());
        textBox.val("");

        return false;
    });

    // post event - image
    $("#post-image input[type=file]").change(function()
    {
        if(this.files.length == 1)
        {
            feed.pushImage(this.files[0]);
        }
        $(this).replaceWith($(this).val("").clone(true));
    });
});
