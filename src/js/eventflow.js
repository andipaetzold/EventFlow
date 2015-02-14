// config
var ref = new Firebase("https://scorching-fire-2873.firebaseio.com");

// feed
var feed = (function($, undefined)
{
    var options = {
        feedRef: null,
        feedContainer: null,

        // callbacks
        childAdded: null
    };

    // config
    var config = function(o)
    {
        $.extend(options, o);

        options.feedRef.on("child_added", childAdded);
    };

    // push
    var push = function(data, type, callback)
    {
        if (options.feedRef != null)
        {
            options.feedRef.push({data: data, type: type, timestamp: Firebase.ServerValue.TIMESTAMP}, function(e)
            {
                if (!e && callback) callback();
            });
        }
    };

    // push - text
    var pushText = function(text, callback)
    {
        if (text.length > 0)
        {
            push(text, "text", callback);
        }
    };

    // push - image
    var pushImage = function(file, callbackPushed)
    {
        var reader = new FileReader();
        reader.onload = function(e) {
            push(reader.result, "image", callbackPushed);
        }
        reader.readAsDataURL(file);
    };

    // update feed
    var childAdded = function(snapshot, prev)
    {
        id   = snapshot.key();
        data = snapshot.val();

        item = $("<div></div>", {id: "item" + id});
        switch(data.type)
        {
            case "image":
                $("<img>", {alt: "image" + id, src: data.data}).appendTo(item);
                break;
            case "text":
                $("<p></p>").text(data.data).appendTo(item);
                break;
        }

        // insert
        prev = $("#item" + prev, options.feedContainer);
        if (prev.length == 1)
        {
            item.insertBefore(prev);
        }
        else
        {
            item.prependTo(options.feedContainer);
        }

        // callback
        if (options.childAdded) options.childAdded(item, id, data);
    };


    // return
    return {
        config:     config,
        pushText:   pushText,
        pushImage:  pushImage
    };
})(jQuery);

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
