$(document).ready(function() {

    initPage();

    // when user clicks on the button to write a response
    $(document).on("click", ".respond", function() { respondToReview($(this).attr("data-id")) });
    // when user clicks on the button to save a review
    $(document).on("click", ".save-review", function() { saveReview($(this).attr("data-id")) });
    // when user clicks the "Saved Reviews" menu item
    $(document).on("click", "#get-saved", function() { getSavedReviews() });
    //when a user clicks the 'Remove Saved Review'
    $(document).on("click", ".remove-review", function() { removeSavedReview($(this).attr("data-id")) });
    // when user clicks the "Scrape New Reviews" menu item
    $(document).on("click", "#scrape-reviews", function() { scrapeNewReviews() });
    //when a user clicks the 'Save Draft Repsonse'
    $(document).on("click", "#save-response", function() { saveResponse($(this).attr("data-id")) });



    function initPage() {
        $("#reviews").empty();

        // Grab the reviews as a json
        $.getJSON("/api/reviews?saved=false", function(data) {
            // For each one
            for (var i = 0; i < data.length; i++) {
                // Display the apropos information on the page
                let $rowContainer = $("<div>").addClass("row review-container text-left");
                let $reviewTitle = $("<h3>").text(data[i].title);
                let $reviewText = $("<div>").addClass("review text").append(data[i].review);
                let $btnRespond = $("<btn>").attr({ "class": "btn btn-secondary buy-btn save-review", 'data-id': data[i]._id }).text("Save Review");
                let $fullReview = $rowContainer.html($reviewTitle).append($reviewText).append($btnRespond);
                $("#reviews").append($fullReview);
                $("#review-list-title").text("Reviews from TripAdvisor")
            }
        });
    }

    function getSavedReviews() {
        $("#reviews").empty();
        $.getJSON("/api/reviews?saved=true", function(data) {

            console.log("/api/reviews?saved=true");
            // For each one
            for (var i = 0; i < data.length; i++) {
                // Display the apropos information on the page
                let $rowContainer = $("<div>").addClass("row review-container text-left");
                let $reviewTitle = $("<h3>").text(data[i].title);
                let $reviewText = $("<div>").addClass("review text").append(data[i].review);
                let $btnRespond = $("<btn>").attr({ "class": "btn btn-secondary buy-btn respond", 'data-id': data[i]._id, 'data-title': data[i].title }).text("Respond to Review");
                let $btnRemove = $("<btn>").attr({ "class": "btn btn-secondary buy-btn remove-review", 'data-id': data[i]._id }).text("Removed Saved Review");
                let $fullReview = $rowContainer.html($reviewTitle).append($reviewText).append($btnRespond).append($btnRemove);
                $("#reviews").append($fullReview);
                $("#review-list-title").text("Your Saved Reviews")
            }
        });
    }

    function respondToReview(reviewID) {
        // Empty the responses from the response section

        console.log('reviewID', reviewID)

        $("#review-title").empty();
        $("#response-text").val("");
        $("#your-name").val("");
        $("#your-position").val("");
        // Save the id from the p tag

        // Now make an ajax call for the Article
        $.ajax({
                method: "GET",
                url: "api/reviews/response/" + reviewID
            })
            // With that done, add the response information to the page
            .done(function(data) {

                $('#modal-response').modal('show');

                console.log(data);
                // The title of the article
                $("#review-title").append("<h2>" + data.title + "</h2>");
                // A button to submit a new response, with the id of the article saved to it
                $("#save-response").attr({ "data-id": data._id });

                // If there's a response in the article
                if (data.response) {
                    // Place the data of the response in inputs
                    $("#response-text").val(data.response.text);
                    $("#your-name").val(data.response.name);
                    $("#your-position").val(data.response.position);

                }
            });
    };

    // called when user clicks to save a review
    function removeSavedReview(reviewID) {

        // Run a POST request to change the review to saved: true
        $.ajax({
                method: "POST",
                url: "api/reviews/" + reviewID,
                data: {
                    saved: false
                }
            })
            // With that done
            .done(function(data) {
                // Log the response
                console.log(data);
                getSavedReviews();
                $('#modal-review-removed').modal('show');
            });
        
    };



    // called when user clicks to save a review
    function saveReview(reviewID) {

        // Run a POST request to change the review to saved: true
        $.ajax({
                method: "POST",
                url: "api/reviews/" + reviewID,
                data: {
                    saved: true
                }
            })
            // With that done
            .done(function(data) {
                // Log the response
                console.log(data);
                initPage();
                $('#modal-response-confirm').modal('show');
                
            });
        
    };


    // called when user clicks to save a review
    function saveResponse(reviewID) {

        // Run a POST request to change the response, using what's entered in the inputs
        $.ajax({
                method: "POST",
                url: "api/reviews/response/" + reviewID,
                data: {
                    text: $("#response-text").val(),
                    name: $("#your-name").val(),
                    position: $("#your-position").val()
                }
            })
            // With that done
            .done(function(data) {
                // Log the response
                console.log(data);
                $('#modal-response').modal('hide');
                $('#modal-response-confirm').modal('show');
            });
    };




    function scrapeNewReviews() {
        console.log('scrapeNewReviews')
        $.get("api/scrape").then(function(res) {
            initPage();
            $("#scrape-response").text(res)
            $('#modal-scrape-confirm').modal('show');

        });
    }


});