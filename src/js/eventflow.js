// config
var ref = new Firebase("https://scorching-fire-2873.firebaseio.com");

// feed
var feed = (function($, undefined)
{
    var options = {
        feedRef: null,
        feedContainer: null,

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
        var data = new FormData();
        data.append("file", file);
        data.append("upload_preset", options.cloudinary_preset);

        $.ajax("https://api.cloudinary.com/v1_1/" + options.cloudinary_cloud_name + "/image/upload", {
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            type: "POST",
            success: function(response)
            {
                pushImage(response.secure_url, callbackPushed);
            }
        });
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

        // update visibility
        updateVisibility();

        // callback
        if (options.childAdded) options.childAdded(item, id, data);
    };

    var childRemoved = function(snapshot)
    {
        var id = snapshot.key();
        var data = snapshot.val();
        $("#item" + id, options.feedContainer).remove();

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
        // update visibility
        options.feedContainer.children().slice(showCount).hide();
        options.feedContainer.children().slice(0, showCount - 1).show();
    };

    // return
    return {
        config:     config,
        pushText:   pushText,
        pushImage:  pushImage,
        uploadImage:  uploadImage,
        more: more
    };
})(jQuery);

// auth
var auth = (function($, undefined)
{
    var options = {
        ref: null,

        login:  null,
        logout: null
    };

    // config
    var config = function(o)
    {
        $.extend(options, o);

        options.ref.onAuth(function(authData)
        {
            (authData ? options.login : options.logout)();
        });
    };

    // login
    var login = function(email, password)
    {
        options.ref.authWithPassword({
            email: email,
            password: password
        }, function(error)
        {
            if (error) alert("Invalid Login");
        });
    };

    // logout
    var logout = function()
    {
        options.ref.unauth();
    };

    return {
        config: config,

        login:  login,
        logout: logout
    };
})(jQuery);

// on ready
$(function()
{
    feed.config({
        feedRef: ref.child("feed"),
        feedContainer: $("#feed"),

        cloudinary_cloud_name: "andipaetzold",
        cloudinary_preset: "eventflow"
    });

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
            feed.uploadImage(this.files[0]);
        }
        $(this).replaceWith($(this).val("").clone(true));
    });

    // post event - camera
    navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

    if (!navigator.getUserMedia)
    {
        $("#post-camera").prev().hide();
        $("#post-camera").hide();
    }

    var video = $("#post-camera video").hide();
    $("#camera-activate").click(function()
    {
        var that = this;
        navigator.getUserMedia({video: true, audio: false}, function (stream)
        {
            // show / hide
            $(that).hide();
            video.show();
            $("#interval").show();

            video.attr("src", window.URL.createObjectURL(stream));
        }, function (e)
        {
            console.log(e);
        });
    });

    video.click(camaraPhoto);

    var camaraPhoto = function()
    {
        var height = video.height();
        var width  = video.width();
        var canvas = $("<canvas></canvas>");
        canvas.attr("height", height);
        canvas.attr("width", width);
        canvas[0].getContext("2d").drawImage(video[0], 0, 0, width, height);

        var data = canvas[0].toDataURL("image/jpeg", 0.5);
        feed.pushImage(data);
    };

    // show more
    $("#more").click(feed.more);

    // authentification
    auth.config({
        ref: ref,

        login: function()
        {
            $("#logout").show();
            $("#post").show();
            $("#login").hide();

            $("#login input[type=text], #logout input[type=password]").val("");
        },
        logout: function()
        {
            $("#logout").hide();
            $("#post").hide();
            $("#login").show();
        }
    });

    // login
    $("#login form").submit(function(e)
    {
        e.preventDefault();

        auth.login($("input[type=text]", this).val(), $("input[type=password]", this).val());
    });

    // login
    $("#logout input[type=button]").click(function()
    {
        auth.logout();
    });

    // interval
    $("#interval-countdown").hide();
    $("#interval").hide();

    var interval = null;

    $("#interval-toggle").click(function()
    {
        if (!interval)
        {
            // show / hide
            $(this).val("Stop");
            $("#interval-time").hide();
            $("#interval-countdown").show();

            // countdown
            $("#interval-countdown")
                .val(0)
                .attr("max", $("#interval-time").val());

            // interval
            clearInterval(interval);
            interval = setInterval(function()
            {
                var ic = $("#interval-countdown");
                ic.val(ic.val() + 0.1);

                if (ic.val() == ic.attr("max"))
                {
                    ic.val(0);
                    camaraPhoto();
                }
            }, 100);

        }
        else
        {
            clearInterval(interval);
            interval = null;
            // show / hide
            $(this).val("Start");
            $("#interval-time").show();
            $("#interval-countdown").hide();

        }
    });
});
