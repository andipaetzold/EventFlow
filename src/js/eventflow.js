// config
var ref = new Firebase("https://scorching-fire-2873.firebaseio.com");

// on ready
$(function()
{
    feed.config({
        feedRef: ref.child("feed"),
        feedContainer: $("#feed"),

        progressContainer: $("#progress"),

        moreContainer: $("#more"),

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
    $("#post-text-form").submit(function()
    {
        var textBox = $("#post-text-text");
        feed.pushText(textBox.val());
        textBox.val("");

        return false;
    });

    // post event - image
    $("#post-image-file").change(function()
    {
        if(this.files.length >= 1)
        {
            $.each(this.files, function(index, file)
            {
                feed.uploadImage(file);
            });

            $(this).replaceWith($(this).val("").clone(true));
        }
    });

    // post event - camera
    navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

    if (!navigator.getUserMedia)
    {
        $("#post-camera").prev().hide();
        $("#post-camera").hide();
    }

    var video = $("#post-camera-video").hide();
    $("#post-camera-activate").click(function()
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


    var camaraPhoto = function()
    {
        // get size
        var height = video[0].videoHeight;
        var width  = video[0].videoWidth;

        // create canvas
        var canvas = $("<canvas></canvas>");
        canvas.attr("height", height);
        canvas.attr("width", width);
        canvas[0].getContext("2d").drawImage(video[0], 0, 0, width, height);

        // create data url
        var dataURL = canvas[0].toDataURL("image/jpeg", 0.5);

        // destroy canvas
        canvas.remove();

        // url to blob
        var dataURLToBlob = function(dataURL)
        {
            var BASE64_MARKER = ";base64,";
            if (dataURL.indexOf(BASE64_MARKER) == -1)
            {
                var parts = dataURL.split(",");
                var contentType = parts[0].split(":")[1];
                var raw = decodeURIComponent(parts[1]);

                return new Blob([raw], {type: contentType});
            }

            var parts = dataURL.split(BASE64_MARKER);
            var contentType = parts[0].split(":")[1];
            var raw = window.atob(parts[1]);
            var rawLength = raw.length;

            var uInt8Array = new Uint8Array(rawLength);

            for (var i = 0; i < rawLength; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }

            return new Blob([uInt8Array], {type: contentType});
        }
        var blob = dataURLToBlob(dataURL);
        feed.uploadImage(blob);
    };

    video.click(camaraPhoto);

    // show more
    $("#more").click(feed.more);

    // authentification
    auth.config({
        ref: ref,

        login: function()
        {
            $("#login").hide();
            $("#logout").show();
            $("#post").show();

            $("#login-email, #login-password").val("");
        },
        logout: function()
        {
            $("#logout").hide();
            $("#post").hide();
            $("#login").show();
        }
    });

    // login
    $("#login-form").submit(function(e)
    {
        e.preventDefault();

        auth.login($("#login-email").val(), $("#login-password").val());
    });

    // logout
    $("#logout-form").submit(function(e)
    {
        e.preventDefault();

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
            $(this).html("Stop");
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
            $(this).html("Start");
            $("#interval-time").show();
            $("#interval-countdown").hide();

        }
    });
});
