


const validProjects = ['frontales-mg', 'frantal_mg', 'frontalmg']; // Filter based on inspection

export interface RoboflowProjectClasses {
    id: string;
    name: string;
    classes: string[];
    colors: Record<string, string>;
}

export const fetchProjectClasses = async (apiKey: string, workspace: string): Promise<RoboflowProjectClasses[]> => {
    const url = `https://api.roboflow.com/${workspace}?api_key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Roboflow API Error: ${response.statusText}`);
        }

        const info = await response.json();
        const projects: RoboflowProjectClasses[] = [];

        if (info.workspace && info.workspace.projects) {
            info.workspace.projects.forEach((p: any) => {
                const classes = p.classes ? Object.keys(p.classes) : [];
                projects.push({
                    id: p.id,
                    name: p.name,
                    classes: classes,
                    colors: p.colors || {}
                });
            });
        }

        return projects;
    } catch (error) {
        console.error("Error fetching project classes:", error);
        throw error;
    }
};
