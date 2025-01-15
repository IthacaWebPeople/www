import dompurify from 'dompurify';
import { format } from 'date-fns';

const newToken = import.meta.env.VITE_GITHUB_API_TOKEN;
const data = `query {
	node(id:"PVT_kwDOBbNjPc4Ad9Mg") {
		... on ProjectV2 {
			items(first:100) {
				nodes {
					content {
						... on Issue {
							number
							title
							bodyHTML
						}
					}
					fieldValues(first:5) {
						nodes {
							... on ProjectV2ItemFieldDateValue {
								date
							}
							... on ProjectV2ItemFieldSingleSelectValue {
								name
							}
						}
					}
				}
			}
		}
	}
}`;

const authHeaders = { 'Authorization': 'Bearer ' + newToken };
const body = JSON.stringify({ query: data });

const renderEvent = (event) => {
	const date = new Date(`${event.date}T18:00:00Z`);
	return `<article>
				<section>
					<h3>${dompurify.sanitize(event.title ?? 'Future Meetup')}</h3>
					<h4>${dompurify.sanitize(format(date, 'EEEE, MMMM d, yyyy'))}</h4>
					<h5>6:00pm &ndash; 7:30pm</h5>
					<p>${dompurify.sanitize(event.description ?? 'TBD')}</p>
				</section>
			</article>`;
}

const getEvents = (json) => json.data.node.items.nodes.map(i => {
	const fields = Object.assign({}, ...i.fieldValues.nodes);
	return {
		id: i.content.number,
		title: i.content.title,
		description: i.content.bodyHTML,
		status: fields.name,
		date: fields.date
	};
}).filter(i => i.status === 'Planned' && i.date);

async function loadEvents() {
	const response = await fetch('https://api.github.com/graphql', {method: 'POST', headers: authHeaders, body: body});
	const json = await response.json();
	const events = getEvents(json);
	const rootElement = document.getElementById('upcoming-events');
	rootElement.innerHTML = events && events.length
		? `${events.map(renderEvent).join('')}`
		: '<div class="warning">There are currently no upcoming events :(</div>';
}

window.onload = loadEvents;