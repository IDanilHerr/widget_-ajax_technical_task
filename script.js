define(['jquery'], function ($) {
	return function () {

		let self = this;
		let settings, w_code;
		function getStyle(w_code) {
		return `
		<style id="${w_code}-copy-lead-style">
			.js-copy-lead-${w_code}{
				background-color: #313942;
			}
			.js-copy-lead-${w_code} .card-widgets__widget__caption__logo {
				color: #E4E4E4;
				font-weight: bold;
				display: block;
				transform: translate(20px, 12px);
				height: 0;
				margin-left: 0;
				padding: 0;
			}
			.js-copy-lead-${w_code} .card-widgets__widget__caption__logo_min {
				color: #E4E4E4;
				font-weight: bold;
				display: block;
				transform: translate(17px, 12px);
				width: 0;
				padding: 0;
			}
			.copy-lead.${w_code} .control--select--list-opened {
				box-sizing: border-box;
				left: 0;
			}
			.copy-lead.${w_code} .select-title {
				padding-top: 10px;
			}
			.copy-lead.${w_code} .copy-lead__info {
				margin-top: 10px;
				text-align: center;
				cursor: default;
			}
			.copy-lead.${w_code} .copy-lead__info_load {
				color: orange;
			}
			.copy-lead.${w_code} .copy-lead__info_error {
				color: red;
			}
			.copy-lead.${w_code} .copy-lead__info_success {
				color: green;
			}
			.copy-lead.${w_code} .copy-lead__button_disable {
				cursor: not-allowed;
			}
			.copy-lead.${w_code} .copy-lead__button {
				margin-top: 10px;
				text-align: center;
				border: 1px solid #D4D5D8;
				border-radius: 3px;
				padding: 5px;
				transition: 0.3s;
			}
			.copy-lead.${w_code} .copy-lead__button:hover {
				background-color: #FBFAFB;
			}
		</style>
		`;
		}

		function replaceTextSelectButton(elem, text) {
			$(elem).find('.control--select--button').text(text);
		}

		this.callbacks = {
			render: function () {
				settings = self.get_settings();
				w_code = settings.widget_code;

				if ($(`#${w_code}-copy-lead-style`).length == 0)
					$('head').append(getStyle(w_code));

				self.render_template({
					caption: {
						class_name: `js-copy-lead-${w_code}`,
						html: ''
					},
					body: '',
					render: `
					<div class="copy-lead ${w_code}">
						<p class="select-title">Воронка:</p>
						<div class="control--select linked-form__select select-pipeline">
							<ul class="custom-scroll control--select--list">
								<li data-value="" class="control--select--list--item control--select--list--item-selected">
									<span class="control--select--list--item-inner" title="Выбрать">
										Выбрать
									</span>
								</li>
							</ul>
							
							<button class="control--select--button" type="button" data-value="" style="border-bottom-width: 1px; background-color: #fff;">
								<span class="control--select--button-inner">
									Выбрать
								</span>
							</button>
							
							<input type="hidden" class="control--select--input " name="select-pipeline" value="" data-prev-value="">
						</div>
						<div class="copy-lead__button copy-lead__button_disable"">Скопировать</div>
						<p class="copy-lead__info"></p>
					</div>`
				});
				let select_pipeline = $(`.copy-lead.${w_code} .select-pipeline`);
				let statuses;
				let pipelines = {};
				$.ajax({
					method: 'GET',
					url: '/api/v4/leads/pipelines',
					dataType: 'json',
					beforeSend: function () {
						replaceTextSelectButton(select_pipeline, 'Загрузка...');
					},
					error: function () {
						replaceTextSelectButton(select_pipeline, 'Ошибка');
					},
					success: function (data) {
						replaceTextSelectButton(select_pipeline, 'Выбрать');

						data._embedded.pipelines.forEach(item => {
							let statuses = item['_embedded']['statuses'];
							pipelines[item['id']] = {
								name: item['name'],
								statuses: {}
							};
							statuses.forEach(elem => {
								if (elem.name.replace(/\s/g, '') != 'Неразобранное')
									pipelines[item['id']]['statuses'][elem['id']] = elem['name'];
							});
						});

						for (let id in pipelines) {
							let str = `
							<li data-value="${id}" class="control--select--list--item">\
								<span class="control--select--list--item-inner" title="${pipelines[id]['name']}">\
									${pipelines[id]['name']}\
								</span>\
							</li>`;
							$(str).appendTo(`.copy-lead.${w_code} .select-pipeline .custom-scroll`);
						}
					}
				});

				$(`.${w_code} [name="select-pipeline"]`).on('change', function () {
					let status_id = $(this).val();
					if (status_id != '') {
						if ($(`.copy-lead.${w_code} .select-status`).length == 0) {
							$(select_pipeline).after(`
							<p class="select-title">Этап:</p>
							<div class="control--select linked-form__select select-status">
								<ul class="custom-scroll control--select--list">
									<li data-value="" class="control--select--list--item control--select--list--item-selected">
										<span class="control--select--list--item-inner" title="Выбрать">
											Выбрать
										</span>
									</li>
								</ul>

								<button class="control--select--button" type="button" data-value="" style="border-bottom-width: 1px; background-color: #fff;">
									<span class="control--select--button-inner">
										Выбрать
									</span>
								</button>
								
								<input type="hidden" class="control--select--input " name="select-status" value="" data-prev-value="">
							</div>`);
						}
						if ($(`.copy-lead.${w_code} .select-status .control--select--list--item`).length > 1) {
							$(`.copy-lead.${w_code} .select-status .control--select--list--item:not(:first-child)`).remove();
							$(`.copy-lead.${w_code} .select-status .control--select--list--item`).addClass('control--select--list--item-selected');
							replaceTextSelectButton(`.copy-lead.${w_code} .select-status`, 'Выбрать');
							$(`.${w_code} [name="select-status"]`).val('');
						}

						statuses = pipelines[status_id]['statuses'];
						for (let id in statuses) {
							let str = `
							<li data-value="${id}" class="control--select--list--item">\
								<span class="control--select--list--item-inner" title="${statuses[id]}">\
									${statuses[id]}\
								</span>\
							</li>`;
							$(str).appendTo(`.copy-lead.${w_code} .select-status .custom-scroll`);
						}
					} else {
						$(`.copy-lead.${w_code} .select-status`).prev().remove();
						$(`.copy-lead.${w_code} .select-status`).remove();
					}
				});

				$(`.copy-lead.${w_code}`).on('change', '[name="select-pipeline"]', function () {
					let change_id = $(this).val();
					if (change_id == '') replaceTextSelectButton($(this).parent(), 'Выбрать');
					else replaceTextSelectButton($(this).parent(), pipelines[change_id]['name']);
					$(`.${w_code} .copy-lead__button`).addClass('copy-lead__button_disable');
				});
				$(`.copy-lead.${w_code}`).on('change', '[name="select-status"]', function () {
					let change_id = $(this).val();
					if (change_id == '') {
						replaceTextSelectButton($(this).parent(), 'Выбрать');
						$(`.${w_code} .copy-lead__button`).addClass('copy-lead__button_disable');
					} else {
						replaceTextSelectButton($(this).parent(), statuses[change_id]);
						$(`.${w_code} .copy-lead__button`).removeClass('copy-lead__button_disable');
					}
				});

				$(`.${w_code} .copy-lead__button`).on('click', function () {
					if (!$(this).hasClass('copy-lead__button_disable')) {
						let pipeline_id = Number($(`.copy-lead.${w_code} [name="select-pipeline"]`).val()),
							status_id = Number($(`.copy-lead.${w_code} [name="select-status"]`).val()),
							lead_id = AMOCRM.data.current_card.id;

							let lead;
							let entity;
							let copy_entity;
							let copy_lead_id;

							function getLead () {
								$.ajax({
								method: 'GET',
								url: '/api/v4/leads/' + lead_id + '?with=contacts',
								dataType: 'json',
								async: false,

								error: function () {
									console.log ('test widget error');
								},
								success: function (data, status) {
									console.log('GET status ' + status);
									lead = data;
								}
							});
							return clearLead (lead);
							}
							
							$.ajax({
								method: 'GET',
								url: '/api/v4/leads/' + lead_id + '/links',
								dataType: 'json',
								async: false,
			
								error: function () {
									console.log ('test widget entity error');
								},
								success: function (data, status) {
									console.log('GET entity status - ' + status);
									entity = data;
								}
							});
			
							function clearLead (lead){
								lead.name += " Komstest";
								lead.status_id = status_id;
								lead.pipeline_id = pipeline_id;
			
								delete lead._embedded.contacts[0]._links;
			
								if (lead.loss_reason_id === null) {
									delete lead.loss_reason_id;
								}
								return lead;
							}
			
							let post = '[' + JSON.stringify(getLead()) + ']';
			
							console.log('post = lead');
							console.log(post);

							$.ajax({
								method: 'POST',
								contentType: 'application/json; charset=utf-8',
								data: post,
								dataType: 'json',
								url: '/api/v4/leads',
								async: false,

								beforeSend: function () {
									console.log('before send');
								},
								error: function (responseText) {
									console.log(responseText);
								},
								success: function (data, status) {
									console.log('succes');
									console.log(status);
									console.log(data);
									console.log(data._embedded.leads[0].id);
									copy_lead_id = data._embedded.leads[0].id;
								}
							});

							console.log('entity - ');
							console.log(entity);
							
							$.ajax({
								method: 'GET',
								url: '/api/v4/leads/' + copy_lead_id + '/links',
								dataType: 'json',
								async: false,

								error: function () {
									console.log('test widget entity error');
								},
								success: function (data, status) {
									console.log('GET entity status ' + status);
									copy_entity = data;
								}
							});

							console.log('copy_entity = ');
							console.log(copy_entity);

							console.log('metadata.main_contact = ');
							console.log(entity._embedded.links[0].metadata.main_contact);

							console.log(JSON.stringify(entity._embedded.links, null, ' '));

							if (entity._embedded.links[0].metadata.hasOwnProperty('main_contact')) {
								console.log('find main_contact key');
								delete Object.assign(entity._embedded.links[0].metadata, {"is_main": entity._embedded.links[0].metadata.main_contact})['main_contact'];
							} else {
								console.log('not find main_contact key');
							}

							console.log('post_entity = ');
							console.log(JSON.stringify(entity._embedded.links, null, ' '));

							post_entity = JSON.stringify(entity._embedded.links);

							$.ajax({
								method: 'POST',
								url: '/api/v4/leads/'+ copy_lead_id +'/link',
								contentType: 'application/json; charset=utf-8',
								dataType: 'json',
								async: false,
								data: post_entity,

								error: function (responseText) {
									console.log ('POST entity Error');
									console.log (responseText);
								},
								success: function (data, status) {
									console.log('entity success');
									console.log(status);
									console.log(data);
								}
			
							})

							if (copy_lead_id !== '') {
								$('.copy-lead__info')
									.removeClass('copy-lead__info_load copy-lead__info_error')
									.addClass('copy-lead__info_success')
									.text('Готово!');
							} else {
								$('.copy-lead__info')
									.removeClass('copy-lead__info_load copy-lead__info_success')
									.addClass('copy-lead__info_error')
									.text('Ошибка');
							}
						}
					});
				

				$(`.js-copy-lead-${w_code} img`).remove();
				$(`.js-copy-lead-${w_code} span`).first().after(`
					<span class="card-widgets__widget__caption__logo">Скопировать</span>
					<span class="card-widgets__widget__caption__logo_min">Скоп</span>
				`);

				// styles
				setInterval(() => {
					if ($('.card-widgets.js-widgets-active').length > 0) {
						$(`.js-copy-lead-${w_code} .card-widgets__widget__caption__logo`).show();
						$(`.js-copy-lead-${w_code} .card-widgets__widget__caption__logo_min`).hide();
					} else {
						$(`.js-copy-lead-${w_code} .card-widgets__widget__caption__logo`).hide();
						$(`.js-copy-lead-${w_code} .card-widgets__widget__caption__logo_min`).show();
					}
				}, 100);

				$(`.copy-lead.${w_code}`).parent().css({
					'background-color': '#fff'
				});
				return true;
			},
			init: function () {
				settings = self.get_settings();
				w_code = settings.widget_code;

				return true;
			},
			bind_actions: function () {
				return true;
			},
			settings: function () {
				return true;
			},
			onSave: function () {
				return true;
			},
			destroy: function () {},
			advancedSettings: function () {
				return true;
			},
			contacts: {
				selected: function () {}
			},
			leads: {
				selected: function () {}
			},
			tasks: {
				selected: function () {}
			}
		};

		return this;
	}
});