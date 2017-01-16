// run on document ready
$(function() {

    // set up to use Materialize modals
    $('.modal').modal();

	// click handler to redirect to a page showing all comments for the specified article
	$(".article-table").on("click", ".comments-show", function() {

		event.preventDefault();

		console.log("Clicked " + $(this).attr("article-id"));

		window.location.href = `/articles/saved/comments/${$(this).attr("article-id")}`;

	});

	// click handler to open the modal to add a new comment to the specified article
	$(".article-table").on("click", ".comment-add", function() {

		event.preventDefault();

		console.log(`add a comment for ${$(this).attr("article-id")}`);

		// set up the modal to accept user input for the new comment
		$("#add-comment-article-title").text($(this).parent().parent().children().first().children().first().text()); // show associated article title
		$("#comment-save").attr("article-id", $(this).attr("article-id")); // set article id reference for new comment
		$("#comment-save").attr("comment-id", ""); // indicate adding a new comment not editing an existing

		// show the add comment modal and set focus to the input field
		$('#add-comment-modal').modal('open');
		$("#comment-text").focus();

	});

	// click handler to save a new comment to the database for the specified article
	$("#comment-save").on("click", function() {

		event.preventDefault();

		console.log(`save a comment for ${$(this).attr("article-id")}`);
		console.log($("#comment-text").val());

		$.ajax({
			url: "/articles/saved",
			method: "POST",
			data: { type: "Comment", comment: $("#comment-text").val(), articleId: $(this).attr("article-id") }
		}).then( function(response) {
			console.log(`comment is ${response.comment}`);
			console.log(`articleId is ${response.article-id}`);

			$('#add-comment-modal').modal('close');

		})

	});

	// click handler to delete the specified article and all it's associated comments
	$(".article-table").on("click", ".article-delete", function() {

		event.preventDefault();

		console.log("Clicked " + $(this).attr("article-id"));

		// save element context for use in ajax callback
		var btnDelete = $(this);

		// ask the server to delete an existing comment
		$.ajax({
			url: `/articles/saved/${btnDelete.attr("article-id")}`,
			method: "DELETE"
		}).then(() => {

			// we don't want to ask the server for a whole new page, so just delete the row in the table
			btnDelete.parent().parent().remove();

		})

	});

});