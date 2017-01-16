// run on document ready
$(function() {

    // set up to use Materialize modals
    $('.modal').modal();

	// click handler to open the modal to add a new comment to the current article
	$("#comment-add").on("click", () => {

		event.preventDefault();

		console.log(`add a comment for ${$(this).attr("article-id")}`);

		// set up the modal to accept user input for the new comment
		$("#add-comment-article-title").text($("#article-title-link").text()); // show associated article title
		$("#comment-save").attr("article-id", $(this).attr("article-id")); // set article id reference for new comment
		$("#comment-save").attr("comment-id", ""); // indicate adding a new comment not editing an existing

		// show the add comment modal and set focus to the input field
		$('#add-comment-modal').modal('open');
		$("#comment-text").focus();

	});

	// click handler to open the modal to edit an existing comment for the current article
	$(".comment-table").on("click", ".comment-edit", () => {

		event.preventDefault();

		console.log(`edit comment ${$(this).attr("comment-id")}`);

		// set up the modal to accept user input for editing the existing comment
		$("#add-comment-article-title").text($("#article-title-link").text()); // show associated article title
		$("#comment-text").val($(this).parent().parent().children().first().children().first().text()); // show original comment
		$("#comment-save").attr("comment-id", $(this).attr("comment-id")); // set id for comment being edited
		$("#comment-save").attr("article-id", ""); // indicate editing an existing comment not adding a new

		// show the add comment modal and set focus to the input field
		$('#add-comment-modal').modal('open');
		$("#comment-text").focus();

	});

	// click handler to save/update a comment for the current article to the database
	$("#comment-save").on("click", () => {

		event.preventDefault();

		// save element context for use in ajax callback
		var btnEdit = $(this);

		// comment-id not specified means we are adding a new comment to the database
		if (btnEdit.attr("comment-id") == "") {

			console.log(`save a comment for ${btnEdit.attr("article-id")}`);
			console.log($("#comment-text").val());

			// ask the server to save the new comment
			$.ajax({
				url: "/articles/saved/comments",
				method: "POST",
				data: { type: "Comment", comment: $("#comment-text").val(), articleId: btnEdit.attr("article-id") }
			}).then(response => {

				console.log(`comment is ${response.comment}`);
				console.log(`articleId is ${response.articleId}`);
				console.log(`commentId is ${response._id}`);

				// we don't want to ask the server for a whole new page, so just insert a new row in the table
				$(".comment-table tbody").prepend(newCommentRow(response.comment, response._id));
				location.reload(); // but we have to reload from the cache to make sure formatting is correct

				$('#add-comment-modal').modal('close');

			});

		} else {
		// otherwise we are editing the text of an existing comment in the database

			console.log(`save edits for comment ${btnEdit.attr("comment-id")}`);
			console.log($("#comment-text").val());

			// ask the server to update an existing comment
			$.ajax({
				url: "/articles/saved/comments",
				method: "PUT",
				data: { type: "Comment", comment: $("#comment-text").val(), commentId: btnEdit.attr("comment-id") }
			}).then(response => {

				console.log(`comment is ${response.comment}`);
				console.log(`articleId is ${response.articleId}`);
				console.log(`commentId is ${response._id}`);

				// we don't want to ask the server for a whole new page, so just update the row in the table
				btnEdit.parent().parent().children().first().children().first().text(response.comment);
				location.reload(); // but we have to reload from the cache to make sure formatting is correct

				$('#add-comment-modal').modal('close');

			});

		}

	});

	// click handler to delete the specified comment from the database
	$(".comment-table").on("click", ".comment-delete", () => {

		event.preventDefault();

		console.log("Clicked " + $(this).attr("comment-id"));

		// save element context for use in ajax callback
		var btnDelete = $(this);

		// ask the server to delete an existing comment
		$.ajax({
			url: `/articles/saved/comments/delete/${btnDelete.attr("comment-id")}`,
			method: "DELETE"
		}).then(() => {

			// we don't want to ask the server for a whole new page, so just delete the row in the table
			btnDelete.parent().parent().remove();

		})

	});

});

// return an html table row for a newly added comment
function newCommentRow(text, commentId) {

	const trWrapBeg = `<tr>`;
	const tdComment = `<td><p class="comment-text">${text}</p></td>`;
	const tdWrapBtnBeg = `<td class="table-buttons">`;
	const aBtnEdit = `<a class="comment-edit waves-effect waves-light btn" comment-id="${commentId}">Edit</a>`;
	const aBtnDelete = `<a class="comment-delete waves-effect waves-light btn" comment-id="${commentId}">Delete</a>`;
	const tdWrapEnd = `</td>`;
	const trWrapEnd = `</tr>`;

	return trWrapBeg + tdComment + tdWrapBtnBeg + aBtnEdit + aBtnDelete + tdWrapEnd + trWrapEnd;

}