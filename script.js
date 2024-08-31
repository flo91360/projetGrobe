let crossMode = false;
let crossPosition = {}; // Pour stocker la position de la croix
let crossData = {}; // Pour stocker les données des croix

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

// Place une croix et la stocke
function placeCross(event) {
    if (crossMode) {
        var mapContainer = document.getElementById('mapContainer');
        var rect = mapContainer.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        // Créer un nouvel élément pour la croix
        var newCross = document.createElement('div');
        newCross.classList.add('cross');
        newCross.textContent = 'X';
        newCross.style.left = (x - 25) + 'px'; // Centrer la croix
        newCross.style.top = (y - 25) + 'px'; // Centrer la croix
        newCross.style.display = 'block';

        // Ajouter la croix au conteneur
        mapContainer.appendChild(newCross);

        // Sauvegarder la position de la croix
        crossPosition = { x: x, y: y };

        // Désactiver le mode croix
        crossMode = false;
        document.getElementById('addCrossButton').disabled = false;

        // Masquer le champ d'heure et le message
        document.getElementById('timeInputContainer').style.display = 'none';
        document.getElementById('crossMessage').style.display = 'none';

        // Stocker les données de la croix
        let mapKey = getCurrentMapKey();
        console.log("mapKey")
        console.log(mapKey)
        if (!crossData[mapKey]) {
            crossData[mapKey] = [];
        }
        crossData[mapKey].push({ x: x, y: y });

        // Vous pouvez également ajouter ici le code pour démarrer le timer
    }
}

function actionPlaceCross(){
    var mapContainer = document.getElementById('mapContainer');
    var rect = mapContainer.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    // Créer un nouvel élément pour la croix
    var newCross = document.createElement('div');
    newCross.classList.add('cross');
    newCross.textContent = 'X';
    newCross.style.left = (x - 25) + 'px'; // Centrer la croix
    newCross.style.top = (y - 25) + 'px'; // Centrer la croix
    newCross.style.display = 'block';

    // Ajouter la croix au conteneur
    mapContainer.appendChild(newCross);
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

// Restaurer les croix pour la carte donnée
function restoreCrosses(mapKey) {
    console.log(crossData)
    console.log(crossData[mapKey])

    if (crossData[mapKey]) {
        crossData[mapKey].forEach(function(crossInfo) {
            let newCross = document.createElement('div');
            newCross.classList.add('cross');
            newCross.textContent = 'X';
            newCross.style.left = crossInfo.x + 'px';
            newCross.style.top = crossInfo.y + 'px';
            newCross.style.display = 'block';
            document.getElementById('mapContainer').appendChild(newCross);
        });
    }
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
    let mapName = getCurrentImageName();
    console.log("mapName")
    console.log(mapName)
    restoreCrosses(mapName);

    // Afficher le bouton d'ajout de croix
    document.getElementById('addCrossButton').style.display = 'inline';
}

// Fonction pour obtenir le nom de l'image actuelle
function getCurrentImageName() {
    let src = document.getElementById('mainMap').src;
    return src.split('/').pop().split('.').shift(); // Extrait le nom de l'image sans extension
}

// Démarrer le timer pour une croix spécifique
function startTimer(index, mapKey) {
    let crossInfo = crossData[mapKey][index];
    let [hours, minutes] = crossInfo.time.split(':').map(Number);
    let targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);

    let timer = setInterval(function() {
        let now = new Date();
        let timeLeft = targetTime - now;

        if (timeLeft <= 0) {
            clearInterval(timer);
            crossData[mapKey].splice(index, 1); // Supprimer l'élément du tableau
            document.querySelectorAll('.cross')[index].remove(); // Supprimer la croix du DOM
        }
    }, 1000);

    crossData[mapKey][index].timer = timer;
}
