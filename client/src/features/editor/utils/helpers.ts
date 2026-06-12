export const colors = [
    "#958DF1",
    "#F98181",
    "#FBBC88",
    "#FAF594",
    "#70CFF8",
    "#94FADB",
    "#B9F18D",
    "#C3E2C2",
    "#EAECCC",
    "#AFC8AD",
    "#EEC759",
    "#9BB8CD",
    "#FF90BC",
    "#FFC0D9",
    "#DC8686",
    "#7ED7C1",
    "#F3EEEA",
    "#89B9AD",
    "#D0BFFF",
    "#FFF8C9",
    "#CBFFA9",
    "#9BABB8",
    "#E3F4F4",
];

const hashUserId = (id: string): number => {
    let hash = 5381;
    for (let i = 0; i < id.length; i++) {
        hash = (hash * 33) ^ id.charCodeAt(i);
    }
    return Math.abs(hash);
};

export const pickColor = (userId: string): string =>
    colors[hashUserId(userId) % colors.length];

export const getCurrentUser = (name: string, userId: string) => ({
    name,
    color: pickColor(userId),
});
