/**
 * Form validations
 */
(function () {
	var TEXTS = {
		text: 'Pole nesmí zůstat prázdné a musí být vyplněné správně.',
		password: 'Prosím, zadejte heslo.',
		date: 'Prosím, zadejte správné datum.',
		email: 'Prosím, zadejte správný email.',
		number: 'Prosím, zadejte číslo.',
		tel: 'Prosím, zadejte telefonní číslo.',
		file: 'Prosím, vložte soubor.',
		checkbox: 'Prosím, zatrhněte.',
		radio: 'Prosím, vyberte jednu z možností.',
		textarea: 'Pole nesmí zůstat prázdné.',
		select: 'Prosím, vyberte jednu z možností.',
	};

	var $form = $('#form');

	function handleError($el, type) {
		$el.addClass('err');
		var parent = $el.parent();

		if(parent.find('.form__err--msg').length === 0) {
			$el.parent().append('<div class="form__err--msg">' + TEXTS[type] + '</div>');
		}
	}

	if ($form.length) {
		$form.find('#form__submit').click(function (e) {
			e.preventDefault();
			var $parentForm = $(this).closest('form');
			var errCount = 0;

			//reset
			$parentForm.find('.err').removeClass('err');
			$parentForm.find('.form__err--msg').remove();

			//errors
			$parentForm.find('input:invalid').each(function () {
				errCount++;
				handleError($(this), $(this).attr('type'));
			});
			$parentForm.find('textarea[required]').each(function () {
				var ta = $(this);

				if(ta.val().length === 0) {
					errCount++;
					handleError($(this), 'textarea');
				}
			});
			$parentForm.find('select[required]').each(function () {
				var sel = $(this);

				if(sel.val() === null) {
					errCount++;
					handleError($(this), 'select');
				}
			});

			//submit
			if (errCount === 0) {
				$parentForm.submit();
			}
		});
	}
})();