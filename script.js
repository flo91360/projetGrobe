let crossMode = false;
let crossData = {}; // Pour stocker les données des croix
let availableColorsByMap = {}; // Pour stocker les couleurs disponibles par sous-carte
let availableColors = [
    { french: 'violette', css: 'purple' }, 
    { french: 'bleu', css: 'blue' }, 
    { french: 'rouge', css: 'red' }
]; // Liste des couleurs disponibles
let colors = [
    { french: 'violette', css: 'purple' }, 
    { french: 'bleu', css: 'blue' }, 
    { french: 'rouge', css: 'red' }
]; // Liste des couleurs disponibles NE BOUGE PAS
let colorIndex = 0; // Index pour suivre la couleur actuelle
let nextCrossId = 1; // Compteur pour générer des ID uniques

// Fonction pour générer un identifiant unique sous forme de nombre séquentiel
function generateUniqueId() {
    if(nextCrossId > 99)
        nextCrossId = 0 
    return nextCrossId++;
}
// Affiche le champ pour entrer l'heure
function showTimeInput() {
    document.getElementById('timeInputContainer').style.display = 'block';
    document.getElementById('addCrossButton').disabled = true;
}

// Confirme l'heure entrée et affiche le message
function confirmTime() {
    let timeInput = document.getElementById('timeInput').value;
    if (timeInput) {
        crossMode = true; // Activer le mode croix
        
        // Afficher le message à côté du bouton
        let message = document.getElementById('crossMessage');
        message.innerText = "Vous pouvez maintenant placer votre croix.";
        message.style.display = 'inline'; // Rendre le message visible
    } else {
        alert("Veuillez entrer une heure valide.");
    }
}

function initializeColorsForMap(mapKey) {
    if (!availableColorsByMap[mapKey]) {
        console.log("INIT COLOR MAP")
        availableColorsByMap[mapKey] = [
            { french: 'violette', css: 'purple' },
            { french: 'bleu', css: 'blue' },
            { french: 'rouge', css: 'red' }
        ];
    }
}

// Place une croix et la stocke
function placeCross(event) {
    if (crossMode) {
        let mapKey = getCurrentMapKey();
        console.log("coucou")
        console.log(availableColorsByMap[mapKey])
        if (availableColorsByMap[mapKey].length === 0) {
            alert("Toutes les couleurs ont été utilisées.");
            return;
        }

        const crossId = generateUniqueId()
        const listItemId = `list-${crossId}`; // ID distinct pour l'élément de liste


        var mapContainer = document.getElementById('mapContainer');
        var rect = mapContainer.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        // Prendre la première couleur disponible pour cette carte
        let color
        let colorsAvailable = availableColorsByMap[mapKey];
        if (colorsAvailable && colorsAvailable.length > 0) {
            color = colorsAvailable.shift(); // Utiliser shift() sur le tableau de couleurs
        }

        // Créer un nouvel élément pour la croix
        var newCross = document.createElement('div');
        newCross.id = crossId; // Ajouter un ID unique à la croix
        newCross.classList.add('cross');
        newCross.textContent = 'X';
        newCross.style.left = (x - 25) + 'px'; // Centrer la croix
        newCross.style.top = (y - 25) + 'px'; // Centrer la croix
        newCross.style.color = color.css; // Définir la couleur de la croix
        newCross.style.display = 'block';

        // Ajouter la croix au conteneur
        mapContainer.appendChild(newCross);

        // Calculer l'heure limite (heure renseignée + 25 minutes)
        let timeInput = document.getElementById('timeInput').value;
        let [hours, minutes] = timeInput.split(':').map(Number);
        let limitTime = new Date();
        limitTime.setHours(hours, minutes + 25, 0, 0);

        // Stocker les données de la croix
        if (!crossData[mapKey]) {
            crossData[mapKey] = [];
        }


        console.log("crossId creation")
        console.log(crossId)
        crossData[mapKey].push({
            id: crossId,
            listItemId: listItemId,
            time: timeInput,
            color: color,
            x: x, // Enregistrer la position X
            y: y, // Enregistrer la position Y
            limitTime: limitTime // Sauvegarder l'heure limite
        });
        console.log(crossData)

        // Désactiver le mode croix
        crossMode = false;
        document.getElementById('addCrossButton').disabled = false;

        // Masquer le champ d'heure et le message
        document.getElementById('timeInputContainer').style.display = 'none';
        document.getElementById('crossMessage').style.display = 'none';


        // Ajouter la croix à la liste
        addCrossToList(color.french, timeInput, crossId, listItemId);
    }
}


// Restaurer les croix pour la carte donnée
function restoreCrosses(mapKey) {
    let mapContainer = document.getElementById('mapContainer');
    // Réinitialiser les croix existantes
    hideCross();
    console.log(crossData)

    // Réinitialiser la liste des croix
    let listContainer = document.getElementById('crossListItems');
    listContainer.innerHTML = ''; // Vider la liste actuelle

    if (crossData[mapKey]) {
        crossData[mapKey].forEach(function(crossInfo) {
            console.log("crossInfo")
            console.log(crossInfo)
            let newCross = document.createElement('div');
            newCross.classList.add('cross');
            newCross.textContent = 'X';
            newCross.style.color = crossInfo.color.css; // Restaurer la couleur de la croix
            newCross.style.left = (crossInfo.x - 25) + 'px'; // Restaurer la position X
            newCross.style.top = (crossInfo.y - 25) + 'px'; // Restaurer la position Y
            newCross.style.display = 'block';
            // Ajouter la croix au conteneur sans coordonnées
            mapContainer.appendChild(newCross);

            // Retirer la couleur des couleurs disponibles
            availableColorsByMap[mapKey] = availableColorsByMap[mapKey].filter(color => color.css !== crossInfo.color.css);

            document.getElementById('timeInput').value = crossInfo.time ;

             // Ajouter la croix à la liste
             addCrossToList(crossInfo.color.french, crossInfo.time, crossInfo.id, crossInfo.listItemId);
        });
    }
}

         
function updateCountdown(timerElement, limitTime, listItem, crossId, listItemId, mapName, crossColor){
    let timerAlmostDone = false;
    function updateTimer() {
        let now = new Date();
        let timeLeft = limitTime - now;

        if (timeLeft <= 0) {
            // Le premier timer a expiré
            clearInterval(timerInterval);
            timerElement.textContent = 'Repop';
            timerElement.classList.add('expired'); // Classe pour définir la couleur verte et le texte en gras
            startSecondTimer(timerElement, listItem, crossId, listItemId); // Démarrer le second timer à côté

        } else {
            let minutes = Math.floor(timeLeft / 60000);
            let seconds = Math.floor((timeLeft % 60000) / 1000);
            timerElement.textContent = `${formatTime(minutes)}:${formatTime(seconds)}`;

            if (timeLeft <= 60000) { // Moins d'une minute
                timerElement.style.fontWeight = 'bold';
                timerElement.style.color = 'green';
                if(timerAlmostDone == false){
                    timerAlmostDone = true
                    // Envoyer un message via le webhook Discord
                    // Envoyer un message via le webhook Discord
                    sendDiscordWebhook(crossId, mapName, crossColor);
                }
            }
        }
    }

    let timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
}

function startSecondTimer(timerElement, listItem, crossId, listItemId) {
    let secondTimerElement = document.createElement('span');
    secondTimerElement.id = `second-timer-${crossId}`;
    secondTimerElement.classList.add('second-countdown');
    
    // Ajouter le second timer à côté du premier
    timerElement.insertAdjacentElement('afterend', secondTimerElement);

    let startTime = new Date();

    function updateSecondTimer() {
        let now = new Date();
        let timeElapsed = now - startTime;

        let minutes = Math.floor(timeElapsed / 60000);
        let seconds = Math.floor((timeElapsed % 60000) / 1000);

        secondTimerElement.textContent = ` + ${formatTime(minutes)}:${formatTime(seconds)}`;

        if (minutes >= 1) {
            clearInterval(secondTimerInterval);
            console.log("crossId")
            console.log(crossId)
            removeCrossFromMapAndList(crossId, listItemId); // Supprimer la croix et la liste après 50 minutes
        }
    }

    let secondTimerInterval = setInterval(updateSecondTimer, 1000);
    updateSecondTimer();
}

function removeCrossFromMapAndList(crossId, listItemId) {
    // Supprimer la croix de la carte
    let cross = document.getElementById(crossId);
    if (cross) { 
        cross.remove();
    }

    // Supprimer l'élément de la liste
    let listItem = document.getElementById(listItemId);
    if (listItem) {
        listItem.remove();
    }

    mapKey = getCurrentMapKey()
    // Retrouver la croix dans les données stockées
    if (crossData[mapKey]) {
        let crossIndex = crossData[mapKey].findIndex(cross => cross.id === crossId);
        if (crossIndex !== -1) {
            let colorUsed = crossData[mapKey][crossIndex].color;

            // Remettre la couleur dans la liste des couleurs disponibles
            availableColorsByMap[mapKey].push(colorUsed);

            // Supprimer la croix des données
            crossData[mapKey].splice(crossIndex, 1);
        }
    }

    // Supprimer les données de la croix de crossData
    let mapKey = getCurrentMapKey();
    if (crossData[mapKey]) {
        crossData[mapKey] = crossData[mapKey].filter(crossInfo => crossInfo.id !== crossId);
    }
}

function formatTime(unit) {
    return unit < 10 ? '0' + unit : unit;
}

function addCrossToList(crossColor, timeEntered, crossId, listItemId) {
    let listContainer = document.getElementById('crossListItems');

    // Vérifier si la croix a déjà été ajoutée pour éviter les doublons
    if (!document.getElementById(listItemId)) {
        let listItem = document.createElement('li');
        listItem.id = listItemId; // Utiliser listItemId pour la liste

        // Créer l'élément pour le timer
        let timerElement = document.createElement('span');
        timerElement.id = `timer-${crossId}`;
        timerElement.classList.add('countdown');

        // Créer l'élément pour le second timer
        let secondTimerElement = document.createElement('span');
        secondTimerElement.id = `second-timer-${crossId}`;
        secondTimerElement.classList.add('second-countdown');

        // Créer le bouton de suppression
        let deleteIcon = document.createElement('span');
        deleteIcon.innerHTML = '&#x1F5D1;'; // Code HTML pour une icône de poubelle
        deleteIcon.classList.add('delete-icon');
        deleteIcon.onclick = function() {
            removeCrossFromMapAndList(crossId, listItemId); // Appeler la fonction de suppression
        };

        listItem.innerHTML = `Croix ${crossColor} à ${timeEntered} - `;
        listItem.appendChild(timerElement);
        listItem.appendChild(secondTimerElement);
        listItem.appendChild(deleteIcon);

        listContainer.appendChild(listItem);

        // Calculer l'heure limite pour le premier timer
        let limitTime = new Date();
        let timeInput = document.getElementById('timeInput').value;
        let [hours, minutes] = timeInput.split(':').map(Number);
        limitTime.setHours(hours, minutes + 25, 0, 0);
        

        console.log("INFOS TIMER")
        console.log(limitTime)
        console.log(timeInput)
 
        // Démarrer le premier timer
        updateCountdown(timerElement, limitTime, listItem, crossId, listItemId,getCurrentMapKey(),crossColor);
    }
}
// Fonction pour obtenir la clé actuelle de la carte
function getCurrentMapKey() {
    let src = document.getElementById('mainMap').src;
    return src.split('/').pop().split('.').shift(); // Extrait le nom de la carte sans extension
}

// Recharger l'image de base et réactiver les zones (areas)
function reloadBaseMap() {
    let mainMap = document.getElementById('mainMap');
    mainMap.src = "images/carteGrobe.png"; // Recharger l'image de base

    // Réactiver toutes les areas
    let areas = document.querySelectorAll('map[name="grobeMap"] area');
    areas.forEach(function(area) {
        area.style.pointerEvents = 'auto'; // Réactiver l'interaction

        // Recalculer les coordonnées et les dimensions à partir de l'attribut coords
        let coords = area.getAttribute('coords').split(',');
        let x = parseInt(coords[0]);
        let y = parseInt(coords[1]);
        let width = parseInt(coords[2]) - x;
        let height = parseInt(coords[3]) - y;

        // Réattacher les événements de survol avec les bonnes valeurs
        area.setAttribute('onclick', 'openMapImage(this)');
        area.setAttribute('onmouseover', `showHighlight(${x}, ${y}, ${width}, ${height})`);
        area.setAttribute('onmouseout', 'hideHighlight()');
    });

    // Masquer le bouton d'ajout de croix et réinitialiser le texte
    document.getElementById('addCrossButton').style.display = 'none';
    document.getElementById('addCrossButton').innerText = "Ajouter une croix";

    // Masquer la croix s'il y en a une
    hideCross();

    // Masquer le message
    document.getElementById('crossMessage').style.display = 'none';
    document.getElementById('crossList').classList.add('hidden'); // Cacher la liste
}

// Masquer la croix
function hideCross() {
    let crosses = document.querySelectorAll('.cross');
    crosses.forEach(cross => cross.remove());
}

// Afficher le rectangle de surbrillance
function showHighlight(x, y, width, height) {
    let highlight = document.getElementById('highlight');
    highlight.style.left = x + 'px';
    highlight.style.top = y + 'px';
    highlight.style.width = width + 'px';
    highlight.style.height = height + 'px';
    highlight.style.display = 'block';
}

// Cacher le rectangle de surbrillance
function hideHighlight() {
    let highlight = document.getElementById('highlight');
    highlight.style.display = 'none';
}


// Réinitialiser la carte et restaurer les croix
function openMapImage(areaElement) {
    let mapPos = areaElement.getAttribute('data-map-pos');
    let imageName = "images/" + "map_" + mapPos + ".png";
    let mainMap = document.getElementById('mainMap');
    mainMap.src = imageName;

    // Désactiver toutes les zones (areas)
    let areas = document.querySelectorAll('map[name="grobeMap"] area');
    areas.forEach(function(area) {
        area.style.pointerEvents = 'none'; // Désactiver l'interaction
        area.removeAttribute('onclick'); // Supprimer l'événement onclick
        area.removeAttribute('onmouseover'); // Supprimer l'événement onmouseover
        area.removeAttribute('onmouseout');  // Supprimer l'événement onmouseout
    });

    // Masquer le rectangle de surbrillance
    hideHighlight();

    // Restaurer les croix enregistrées
    restoreCrosses(getCurrentMapKey());

    initializeColorsForMap(getCurrentMapKey()); // S'assurer que les couleurs sont initialisées

    // Afficher le bouton d'ajout de croix
    document.getElementById('addCrossButton').style.display = 'inline';

    // Afficher la liste des croix
    document.getElementById('crossList').classList.remove('hidden');
}

function sendDiscordWebhook(crossId, subMapName, crossColor) {
    const webhookUrl = "https://discord.com/api/webhooks/1280233218313949224/kR3AFVsnPzchIDP7ISRP31mfHRYeQKKRhz3s45CRQPm1lgi_mSN1p25MwAxXKk9OTgbf";  // Remplacez par l'URL du webhook

    const messageContent = `@here Attention ! Le timer pour la croix **${crossId}** (${subMapName}) de couleur **${crossColor}** va expirer dans moins d'une minute.`;

    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: messageContent
        })
    }).then(response => {
        if (response.ok) {
            console.log("Message envoyé via le webhook");
        } else {
            console.error("Erreur lors de l'envoi du message via le webhook");
        }
    }).catch(error => {
        console.error("Erreur réseau :", error);
    });
}
