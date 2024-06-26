import AbstractComponent from '../AbstractComponent.js';
import * as env from '../../env.js';

export class BlackAutocomplete extends AbstractComponent {
  mount() {
    this.el.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.target.value.length % 3 === 0) {
        this.props.submitButton.classList.add('d-none');
        this.props.loadingButton.classList.remove('d-none');
        fetch(`${env.API_SCHEME}://${env.API_HOST}:${env.API_PORT}/${env.API_VERSION}/autocomplete/player`, {
          method: 'POST',
          headers: {
            'X-Api-Key': `${env.API_KEY}`
          },
          body: JSON.stringify({
            Black: event.target.value
          })
        })
        .then(res => res.json())
        .then(res => {
          this.props.datalist.replaceChildren();
          res.forEach(item => {
            const option = document.createElement('option');
            option.appendChild(document.createTextNode(item));
            option.addEventListener('click', (event) => {
              event.preventDefault();
              this.el.value = item;
            });
            this.props.datalist.append(option);
          });
        })
        .catch(error => {
          // TODO
        })
        .finally(() => {
          this.props.submitButton.classList.remove('d-none');
          this.props.loadingButton.classList.add('d-none');
        });
      }
    });
  }
}

export const blackAutocomplete = new BlackAutocomplete(
  document.querySelector('input[list="blackAutocompleteList"]'),
  {
    datalist: document.getElementById('blackAutocompleteList'),
    submitButton: document.querySelector('button.autocomplete[type="submit"]'),
    loadingButton: document.querySelector('button.autocomplete[type="button"]')
  }
);
