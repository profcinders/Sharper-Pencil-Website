import pixels from "image-pixels"
import palette from "image-palette"
import twColours from "./colour-extract-app/TailwindColours"
import ffxivColours from "./colour-extract-app/FfxivDyeColours"

const allowSubmission = () => {
    const form = document.getElementById("image-upload");
    const input = form.querySelector("input");
    const submit = form.querySelector("button");
    if (input.checkValidity()) {
        submit.removeAttribute("disabled");
    } else {
        submit.setAttribute("disabled");
    }
};

const submitForm = event => {
    event.preventDefault();

    resetPalette();
    processImage();
};

const resetPalette = () => {
    document.getElementById("palette").replaceChildren();
};

const processImage = () => {
    const input = document.getElementById("image-to-analyse");
    if (!input.files || !input.files[0]) {
        return;
    }

    let reader = new FileReader();
    reader.addEventListener("load", event => {
        const imgParent = document.getElementById("input-image");
        const imgEl = document.createElement("img");
        imgEl.src = event.target.result;
        imgEl.setAttribute("class", "w-full");
        imgParent.replaceChildren(imgEl);
        extractColours(event.target.result);
        const section = imgParent.closest("section");
        section.classList.remove("hidden");
        section.classList.add("grid");
    });
    reader.readAsDataURL(input.files[0]);
};

const extractColours = async (img) => {
    let colourList = {};
    switch (document.getElementById("colour-comparison").value) {
        case "twColours":
            colourList = twColours;
            break;
        case "ffxivColours":
            colourList = ffxivColours;
            break;
    }

    const { colors: colours } = palette(await pixels(img), 6);
    for (const i in colours) {
        createSwatch(colours[i], findNearestTailwindColour(colours[i], colourList), colourList);
    }
};

const createSwatch = (colour, text, colours) => {
    let swatch = document.createElement("div");
    swatch.setAttribute("class", "w-32 aspect-square rounded-lg overflow-hidden relative mb-4 mx-auto");

    let colBlock = document.createElement("div");
    colBlock.setAttribute("class", "h-full w-full");
    colBlock.setAttribute("style", `background-color:rgb(${colour[0]},${colour[1]},${colour[2]})`);
    swatch.appendChild(colBlock);

    if (text && text.length) {
        let nameBlock = document.createElement("div");
        nameBlock.setAttribute("class", "bg-black/50 text-white text-center absolute bottom-0 w-full");
        nameBlock.innerText = text;

        let sampleBlock = document.createElement("div");
        sampleBlock.setAttribute("class", "w-3 aspect-square inline-block ml-1 border border-white/50");
        sampleBlock.setAttribute("style", `background-color:${colours[text]}`);
        nameBlock.appendChild(sampleBlock);

        swatch.appendChild(nameBlock);
    }

    document.getElementById("palette").appendChild(swatch);
};

const findNearestTailwindColour = (rgb, colours) => {
    let nearest = Number.POSITIVE_INFINITY;
    let nearestName = "";

    for (const [name, hex] of Object.entries(colours)) {
        let distance = rgbDistance(rgb, hexToRgb(hex));
        if (distance < nearest) {
            nearest = distance;
            nearestName = name;
        }
    }

    return nearestName;
};

const hexToRgb = hex => {
    const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthand, (_, r, g, b) => r + r + g + g + b + b);

    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
};

const rgbDistance = (a, b) => Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2));

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("image-upload");
    form.addEventListener("submit", submitForm);

    const input = form.querySelector("input");
    input.addEventListener("change", allowSubmission);
});