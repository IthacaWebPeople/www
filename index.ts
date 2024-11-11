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
							body
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

window.onload = async () => {
	const response = await fetch('https://api.github.com/graphql', { method: 'POST', headers: authHeaders, body: body });
	const json = await response.json();
	console.log(json);
};