const sampleStream = `[[["w761f", "[[\\\"[ { \\\"id\\\": \\\"1\\\", \\\"question\\\": \\\"What is 2+2?\\\", \\\"solution\\\": \\\"4\\\" } ]\\\", 1], [\\\"other\\\", 2]]"]]`;

function detectAndRelay(rawText) {
    // Escape standard JSON structure
    const jsonMatches = rawText.match(/\[\s*{\s*\\"id\\":\s*\\".+?\\"\s*,.+?\s*\\"\s*}\s*\]/sg) || 
                       rawText.match(/\[\s*{\s*"id":\s*".+?"\s*,.+?\s*}\s*\]/sg);
    
    console.log('Matches found:', jsonMatches ? jsonMatches.length : 0);
    if (jsonMatches) {
        jsonMatches.forEach(jsonStr => {
            const cleanStr = jsonStr.replace(/\\"/g, '"');
            try {
                const data = JSON.parse(cleanStr);
                console.log('Valid JSON:', data[0].question);
            } catch (e) {
                console.log('Invalid JSON block');
            }
        });
    }
}

detectAndRelay(sampleStream);
 tobacco
