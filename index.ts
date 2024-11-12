import dompurify from 'dompurify';

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
	return `<h3>${dompurify.sanitize(event.title)}</h3>
			<h4>${dompurify.sanitize(event.date)}</h4>
			${dompurify.sanitize(event.description)}`;
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

window.onload = async () => {
	const response = await fetch('https://api.github.com/graphql', { method: 'POST', headers: authHeaders, body: body });
	const json = await response.json();
	const events = getEvents(json);
	const rootElement = document.getElementById('upcoming-events');
	rootElement.innerHTML = `${events.map(renderEvent).join('')}`; 
	console.log(json);
};