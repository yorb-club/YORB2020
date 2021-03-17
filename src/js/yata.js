import * as THREE from 'three';

export class YatabaseConnection {
    constructor(scene) {
        this.scene = scene;
        this.textureLoader = new THREE.TextureLoader();

        this.yataIds = [];
    }

    dealWithYata(yata) {
        let userGeneratedPhotos = yata.userGeneratedPhotos;
        for (let i = 0; i < userGeneratedPhotos.length; i++) {
            let pic = userGeneratedPhotos[i];
            if (!this.yataIds.includes(pic._id)) {
                this.yataIds.push(pic._id);

                let tex = this.textureLoader.load(pic.src);
                let mat = new THREE.MeshBasicMaterial({ map: tex });
                let geo = new THREE.BoxGeometry(1, 1, 1);
                let mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(pic.x, pic.y, pic.z);
                this.scene.add(mesh);
            }
        }
    }

    generateAddPhotoModal() {
        if (!document.getElementsByClassName('project-modal')[0]) {
            localStorage.setItem(project.project_id, 'visited');

            let modalEl = document.createElement('div');
            modalEl.className = 'project-modal';
            modalEl.id = id + '_modal';

            let contentEl = document.createElement('div');
            contentEl.className = 'project-modal-content';

            let closeButton = document.createElement('button');
            closeButton.addEventListener('click', () => {
                modalEl.remove();
                // https://stackoverflow.com/questions/19426559/three-js-access-scene-objects-by-name-or-id
                let now = Date.now();
                let link = this.scene.getObjectByName(id);
                link.userData.lastVisitedTime = now;
                this.controls.resume();
                setTimeout(() => {
                    this.activeProjectId = -1;
                }, 100); // this helps reset without reopening the modal
            });
            closeButton.innerHTML = 'X';

            let projectImageEl = document.createElement('img');
            let filename = 'https://itp.nyu.edu' + project.image;
            // let filename = "images/project_thumbnails/" + project.project_id + ".png";
            projectImageEl.src = filename;
            projectImageEl.className = 'project-modal-img';

            let titleEl = document.createElement('h1');
            titleEl.innerHTML = this.parseText(name);
            titleEl.className = 'project-modal-title';

            // names
            let names = '';
            for (let i = 0; i < project.users.length; i++) {
                names += project.users[i].user_name;
                if (i < project.users.length - 1) {
                    names += ' & ';
                }
            }
            let namesEl = document.createElement('p');
            namesEl.innerHTML = names;
            namesEl.className = 'project-modal-names';

            let elevatorPitchHeaderEl = document.createElement('p');
            elevatorPitchHeaderEl.innerHTML = 'Elevator Pitch';
            let elevatorPitchEl = document.createElement('p');
            elevatorPitchEl.innerHTML = this.parseText(pitch);
            elevatorPitchEl.className = 'project-modal-text';

            let descriptionHeaderEl = document.createElement('p');
            descriptionHeaderEl.innerHTML = 'Description';
            let descriptionEl = document.createElement('p');
            descriptionEl.innerHTML = this.parseText(description);
            descriptionEl.className = 'project-modal-text';

            let talkToCreatorDiv = document.createElement('div');
            talkToCreatorDiv.className = 'project-modal-links-header';
            talkToCreatorDiv.innerHTML = 'Talk To The Project Creator In The Zoom Room:';

            let linksDiv = document.createElement('div');
            linksDiv.className = 'project-modal-link-container';

            let projectLinkEl = document.createElement('a');
            // projectLinkEl.href = link;
            projectLinkEl.href = project.url;
            projectLinkEl.innerHTML = 'Project Website';
            projectLinkEl.target = '_blank';
            projectLinkEl.rel = 'noopener noreferrer';

            let zoomLinkEl = document.createElement('a');
            // zoomLinkEl.href = link
            zoomLinkEl.href = link;
            zoomLinkEl.innerHTML = 'Zoom Room - ' + room_status;
            zoomLinkEl.target = '_blank';
            zoomLinkEl.rel = 'noopener noreferrer';

            linksDiv.appendChild(projectLinkEl);
            linksDiv.innerHTML += '&nbsp;&nbsp;&nbsp;*&nbsp;&nbsp;&nbsp;';
            linksDiv.appendChild(zoomLinkEl);

            contentEl.appendChild(closeButton);
            contentEl.appendChild(projectImageEl);
            contentEl.appendChild(titleEl);
            contentEl.appendChild(namesEl);
            contentEl.appendChild(elevatorPitchHeaderEl);
            contentEl.appendChild(elevatorPitchEl);
            contentEl.appendChild(descriptionHeaderEl);
            contentEl.appendChild(descriptionEl);
            contentEl.appendChild(talkToCreatorDiv);
            contentEl.appendChild(linksDiv);

            modalEl.appendChild(contentEl);
            document.body.appendChild(modalEl);
        }
    }
}
