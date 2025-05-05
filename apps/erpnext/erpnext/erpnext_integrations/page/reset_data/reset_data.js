frappe.pages['reset-data'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Reset Buying Data',
        single_column: true
    });

    // HTML avec zone pour message
    $(page.body).html(`
        <div class="container mt-4">
            <button class="btn btn-danger" id="reset-button">Clear Database</button>
            <div id="result" class="mt-3 text-success font-weight-bold"></div>
        </div>
    `);

    // Comportement du bouton
    $('#reset-button').on('click', function() {
        // Création du modal de confirmation
        let dialog = new frappe.ui.Dialog({
            title: __('Confirmation Required'),
            fields: [
                {
                    fieldtype: 'HTML',
                    fieldname: 'confirmation_message',
                    options: `
                        <div class="alert alert-danger">
                            <strong>Warning!</strong> This action will permanently delete all buying data.
                            Are you sure you want to proceed?
                        </div>
                        <div class="mt-3">
                            <label class="mb-2">Type "CONFIRM" to proceed:</label>
                            <input type="text" class="form-control" value="CONFIRM" id="confirmation-text">
                        </div>
                    `
                }
            ],
            primary_action_label: __('Proceed'),
            primary_action: function() {
                let confirmationText = $('#confirmation-text').val();
                if (confirmationText === "CONFIRM") {
                    dialog.hide();
                    executeReset();
                } else {
                    frappe.msgprint({
                        title: __('Invalid Confirmation'),
                        message: __('Please type "CONFIRM" exactly to proceed.'),
                        indicator: 'red'
                    });
                }
            },
            secondary_action_label: __('Cancel'),
            secondary_action: function() {
                dialog.hide();
            }
        });

        dialog.show();

        function executeReset() {
            // Afficher un indicateur de chargement
            let btn = $('#reset-button');
            btn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Processing...');

            frappe.call({
                method: "reset_db.clear_database.clear_buying_data",
                callback: function(r) {
                    btn.prop('disabled', false).text('Clear Database');
                    if (!r.exc && r.message) {
                        $('#result').text(r.message);
                        frappe.msgprint({
                            title: __('Success'),
                            message: r.message,
                            indicator: 'green'
                        });
                    } else {
                        frappe.msgprint({
                            title: __('Error'),
                            message: r.exc ? r.exc : "Une erreur est survenue.",
                            indicator: 'red'
                        });
                    }
                },
                error: function() {
                    btn.prop('disabled', false).text('Clear Database');
                }
            });
        }
    });
}