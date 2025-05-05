frappe.pages['csv-import'].on_page_load = function(wrapper) {
	  // Créer la page
	  var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Import Purchase Orders',
        single_column: true
    });

    // Contenu HTML du formulaire
    let form_html = `
        <div class="container mt-4">
            <div class="row">
                <div class="col-md-8 offset-md-2">
                    <form id="file-upload-form">
                        <div class="form-group">
                            <label for="file1">Fichier CSV</label>
                            <div class="input-group">
                                <input type="file" class="form-control-file" id="file1" name="file1" accept=".csv" style="display: none;">
                                <button type="button" class="btn btn-outline-primary select-file-btn" data-input-id="file1">
                                    Choisir un fichier CSV
                                </button>
                                <span class="selected-file-name ml-2" id="file1-name">Aucun fichier sélectionné</span>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">Importer</button>
                    </form>
                    <div id="import-errors" class="mt-3" style="color: red;"></div>
                    <div id="import-success" class="mt-3" style="color: green;"></div>
                </div>
            </div>
        </div>
    `;

    // Ajouter le formulaire à la page
    $(page.body).append(form_html);

    // Gestionnaire pour le bouton de sélection de fichier
    $('.select-file-btn').on('click', function() {
        let inputId = $(this).data('input-id');
        $('#' + inputId).click();
    });

    // Afficher le nom du fichier sélectionné
    $('#file1').on('change', function() {
        let fileName = this.files.length > 0 ? this.files[0].name : 'Aucun fichier sélectionné';
        $('#file1-name').text(fileName);
    });

    // Gestionnaire d'événement pour la soumission du formulaire
    $('#file-upload-form').on('submit', function(e) {
        e.preventDefault();

        // Réinitialiser les messages
        $('#import-errors').empty();
        $('#import-success').empty();

        // Récupérer le fichier
        let file = $('#file1')[0].files[0];

        // Vérifier si un fichier est sélectionné
        if (!file) {
            frappe.msgprint('Veuillez sélectionner un fichier CSV.');
            return;
        }

        // Créer un FormData pour envoyer le fichier
        let formData = new FormData();
        formData.append('file', file);
        formData.append('is_private', '1');

        // Envoyer le fichier via fetch
        fetch('/api/method/custom_import.import_purchase_orders.import_purchase_orders', {
            method: 'POST',
            headers: {
                'X-Frappe-CSRF-Token': frappe.csrf_token
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                if (data.message.errors && data.message.errors.length > 0) {
                    console.log("errors : " + data.message.errors);

                    // Afficher les erreurs
                    let errorHtml = '<ul>' + data.message.errors.map(err => `<li>${err}</li>`).join('') + '</ul>';
                    $('#import-errors').html(errorHtml);
                } else {
                    // Afficher le message de succès
                    $('#import-success').text('Importation réussie ! ' + (data.message.success_count || 0) + ' commandes d\'achat importées.');
                }
            } else {
                frappe.msgprint('Erreur lors de l\'importation : réponse inattendue du serveur.');
            }
        })
        .catch(err => {
            console.error(err);
            frappe.msgprint('Erreur lors de l\'importation du fichier : ' + err.message);
        });
    });
}