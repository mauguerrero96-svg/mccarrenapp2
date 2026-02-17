// Native fetch used


async function trigger() {
    console.log('Triggering Draw Generation...');
    const res = await fetch('http://localhost:3000/api/generate-draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tournament_id: '5a49cc9b-93b1-4935-bd19-434278318b08', // ID from previous step
            seeding_mode: 'random'
        })
    });

    if (!res.ok) {
        console.error('API Error:', res.status, await res.text());
    } else {
        const json = await res.json();
        console.log('Success:', json);
    }
}

trigger();
