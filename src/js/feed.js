var feed = (function($, undefined)
{
    var options = {
        feedRef: null,
        feedContainer: null,

        // progress
        progressContainer: null,

        // more
        moreContainer: null,

        // cloudinary
        cloudinary_cloud_name: "",
        cloudinary_preset: null,

        // callbacks
        childAdded: null,
        childRemoved: null
    };

    // item count to show
    var showCount = 5;

    // config
    var config = function(o)
    {
        $.extend(options, o);

        options.feedRef.on("child_added", childAdded);
        options.feedRef.on("child_removed", childRemoved);

        updateVisibility();
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
    var pushImage = function(data, callback)
    {
        push(data, "image", callback);
    };

    // upload image
    var uploadImage = function(file, callbackPushed)
    {
        // create form data
        var data = new FormData();
        data.append("file", file);
        data.append("upload_preset", options.cloudinary_preset);

        // progress
        var progress = $("<progress></progress>").appendTo(options.progressContainer);

        // start upload
        $.ajax("https://api.cloudinary.com/v1_1/" + options.cloudinary_cloud_name + "/image/upload", {
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            type: "POST",
            success: function(response)
            {
                progress.remove();

                if (response.resource_type == "image")
                {
                    // build url
                    var url = "https://res.cloudinary.com/" + options.cloudinary_cloud_name + "/image/upload/";
                    url += "c_lfill,w_900,q_80"; // limited fill, width: 900, quality: 80
                    url += "/" + response.public_id + "." + response.format;
                    pushImage(url, callbackPushed);
                }
            },
            progress: function(e)
            {
                if (e.lengthComputable)
                {
                    progress.attr("max", e.total);
                    progress.attr("value", e.loaded);
                }
            }
        });
    };

    // update feed - added
    var formatTimestamp = function(timestamp)
    {
        var date = new Date(timestamp);

        var output = "";
        output += date.toLocaleDateString();
        output += " ";
        output += date.toLocaleTimeString();

        return output;
    };

    var childAdded = function(snapshot, prev)
    {
        id   = snapshot.key();
        data = snapshot.val();

        item = $("<div></div>", {id: "item" + id});
        item.attr("data-prev", prev);
        switch(data.type)
        {
            case "image":
                $("<img>", {alt: "image" + id, src: data.data}).appendTo(item);
                break;
            case "text":
                $("<p></p>").text(data.data).appendTo(item);
                break;
        }

        // footer
        var footer = $("<div></div>")
            .addClass("footer")
            .appendTo(item);

        // footer - left
        $("<a></a>")
            .html("Delete")
            .attr("href", "#")
            .attr("data-action", "delete")
            .click(function(ref)
            {
                return function(e)
                {
                    ref.remove();
                    return false;
                };
            }(snapshot.ref()))
            .appendTo(footer);

        // footer - right
        $("<span></span>")
            .html(formatTimestamp(data.timestamp))
            .appendTo(footer);

        // footer - clear
        $("<div></div>")
            .addClass("clear")
            .appendTo(footer);

        // insert
        var prevItem = $("#item" + prev, options.feedContainer);
        var nextItem = $("div[data-prev=" + id + "]", options.feedContainer);
        if (prev == null)
        {
            item.appendTo(options.feedContainer);
        }
        else if (prevItem.length == 1)
        {
            item.insertBefore(prevItem);
        }
        else if (nextItem.length == 1)
        {
            item.insertAfter(nextItem);
        }
        else
        {
            item.prependTo(options.feedContainer);
        }

        // update visibility
        updateVisibility();

        // callback
        if (options.childAdded) options.childAdded(item, id, data);
    };

    // update feed - removed
    var childRemoved = function(snapshot)
    {
        var id = snapshot.key();
        var data = snapshot.val();
        $("#item" + id, options.feedContainer).remove();

        // update visibility
        updateVisibility();

        // callback
        if (options.childRemoved) options.childRemoved(id, data);
    };

    // show more
    var more = function()
    {
        showCount += 5;
        updateVisibility();
    };

    // update visibility
    var updateVisibility = function()
    {
        // update items
        options.feedContainer.children().slice(showCount).hide();
        options.feedContainer.children().slice(0, showCount - 1).show();

        // update more button
        if ($("> div", options.feedContainer).length <= showCount)
        {
            options.moreContainer.hide();
        }
        else
        {
            options.moreContainer.css("display", "block");
        }
    };

    // return
    return {
        config:     config,
        pushText:   pushText,
        uploadImage:  uploadImage,
        more: more
    };
})(jQuery);
