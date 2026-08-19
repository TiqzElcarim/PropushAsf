import {
    makeExit
} from "./shared-LYPBMJUV.js";
import {
    parseConfig
} from "./shared-UZMWQ2FU.js";
import "./shared-AIHWBSO2.js";
import {
    getTranslations
} from "./shared-PU6GMLSZ.js";
import "./shared-UUDV3B35.js";
import "./shared-TMCNPBCK.js";
var CURRENT_QUESTION_KEY = "step";

function removeUrlParameter(paramKey) {
    const url = window.location.href;
    const r = new URL(url);
    r.searchParams.delete(paramKey);
    const newUrl = r.href;
    window.history.replaceState(window.history.state, "", newUrl);
}
var getCurrentStepFromURL = (key = CURRENT_QUESTION_KEY, shouldDeleteKey = true) => {
    const url = new URL(window.location.href);
    const step = url.searchParams.get(key);
    if (shouldDeleteKey) removeUrlParameter(key);
    return step;
};
var getTranslation = (translations, key, defaultValue = "No data") => {
    if (!key || !translations[key]) {
        console.warn(!key ? "Key is not found" : `Key "${key}" is not found in translation files.`);
        return defaultValue;
    }
    return translations[key];
};
var tabUnderClick = async (config, newTabParamValue, key = CURRENT_QUESTION_KEY) => {
    const newTab = new URL(window.location.href);
    newTab.searchParams.set(key, newTabParamValue.toString());
    makeExit({
            ...config,
            tabUnderClick: {
                ...config.tabUnderClick,
                newTab: {
                    url: newTab.toString()
                }
            }
        },
        "tabUnderClick"
    );
};
var handleSurveyStep = ({
    actionType,
    config,
    onNextStep,
    onProgressStart,
    nextStepNumber,
    customActions
}) => {
    if (!config || !actionType) return;
    const DEFAULT_ACTIONS = {
        nextStep: onNextStep,
        progress: onProgressStart,
        tabUnderClick: () => {
            onNextStep == null ? void 0 : onNextStep();
            tabUnderClick(config, nextStepNumber);
        },
        ...customActions
    };
    let handler = DEFAULT_ACTIONS[actionType];
    if (!handler) {
        handler = () => {
            var _a;
            onNextStep == null ? void 0 : onNextStep();
            (_a = makeExit) == null ? void 0 : _a(config, actionType);
        };
    }
    handler();
};
var readSurveyConfig = async () => {
    var _a;
    try {
        const surveyConfig = SURVEY_JS;
        if (!(surveyConfig == null ? void 0 : surveyConfig.length)) {
            console.warn("SURVEY_JS is missing or empty \u2014 survey.js needs a non-empty SURVEY_JS array");
            document.body.innerHTML = `
              <p style="width:100vw;height:100vh;display:flex;justify-content:center;align-items: center;">LANDING CAN'T BE RENDERED. \u{1F514} PLEASE CREATE AND FILL survey.js FILE IN ROOT FOLDER</p>
          `;
            return void 0;
        }
        return surveyConfig;
    } catch (error) {
        if (error instanceof Error) {
            console.error(`${error.message} \u2014 check the content of survey.js`);
            (_a = window.syncMetric) == null ? void 0 : _a.call(window, {
                event: "error",
                errorMessage: error.message,
                errorType: "CUSTOM",
                errorSubType: "ReadSurveyConfig"
            });
        }
    }
};
var loadFallbackTranslation = async () => {
    return await import("./shared-HDCZ7IOL.js").then((m) => m.default);
};
var HEART_ANIMATE_DELAY = 25;
var HEART_INIT_DELAY = 5;
var HEART_MAX_COUNT = 3;
var SPEED = 1;
var STEP_CHANGE_DELAY = 500;

function animateHeart(elHeart, index) {
    const x = +elHeart.style.left.substring(0, elHeart.style.left.length - 2);
    let y = +elHeart.style.top.substring(0, elHeart.style.top.length - 2);
    const direction = 1 - Math.round(Math.random()) * 2;
    const bound = 30 + Math.random() * 20;
    const scale = Math.random() * Math.random() * 0.8 + 0.2;
    let counter = 0;
    const id = setInterval(() => {
        counter += 1;
        elHeart.style.top = `${y}px`;
        elHeart.style.left = `${x}${direction * bound * Math.sin(y * scale / 30) / y * 100}px`;
        if (counter >= HEART_MAX_COUNT * HEART_MAX_COUNT) {
            clearInterval(id);
        }
        y -= SPEED + index * 3;
    }, HEART_ANIMATE_DELAY);
}

function generateHeart(scale) {
    const elHeart = document.createElement("div");
    elHeart.setAttribute("class", "heart");
    elHeart.style.left = "100%";
    elHeart.style.top = "100%";
    elHeart.style.transform = `scale(${scale})`;
    return elHeart;
}

function initHeart(event) {
    let counter = 0;
    const id = setInterval(() => {
        const scale = Math.random() * Math.random() * 0.8 + 0.2;
        const elHeart = generateHeart(scale);
        counter += 1;
        if (event.target instanceof Element) {
            event.target.appendChild(elHeart);
        }
        animateHeart(elHeart, counter);
        if (counter >= HEART_MAX_COUNT) {
            clearInterval(id);
        }
    }, HEART_INIT_DELAY);
}
var generateSurvey = async () => {
    var _a;
    const survey = await readSurveyConfig();
    const config = parseConfig();
    console.log(config);
    if (!survey) {
        console.error(
            "generateSurvey called but no SURVEY_JS available \u2014 landing cannot render survey steps"
        );
        return;
    }
    const surveyStepNodes = [];
    const surveyContainer = document.querySelector(".survey-container");
    const elProgressBar = document.querySelector(".progress .bar");
    const stepFromUrl = getCurrentStepFromURL();
    const getCurrentStep = () => {
        return survey.length - surveyStepNodes.length;
    };
    const nextStep = () => {
        if (surveyStepNodes.length) {
            const stepCurrent = survey.length - surveyStepNodes.length;
            if (elProgressBar) {
                elProgressBar.style.width = `${stepCurrent * 100 / (survey.length - 1)}%`;
            }
            let currentElement = surveyStepNodes.shift();
            if (stepFromUrl) {
                const targetStep = Number(stepFromUrl);
                if (targetStep > stepCurrent) {
                    for (let i = 0; i < targetStep - stepCurrent - 1; i++) {
                        currentElement = surveyStepNodes.shift();
                    }
                }
            }
            if (surveyContainer) {
                surveyContainer.innerHTML = "";
                surveyContainer.append(currentElement);
            }
        }
    };
    const onNextStep = (evt) => {
        console.log("Next step worked");
        initHeart(evt);
        setTimeout(() => {
            nextStep();
        }, STEP_CHANGE_DELAY);
    };
    if (survey && survey.length) {
        const templateNode = document.querySelector("#step");
        if (!templateNode) {
            console.error("Survey #step template not found \u2014 survey cannot render");
            return;
        }
        const answerLeft = document.querySelector("#step-answer-left");
        const answerRight = document.querySelector("#step-answer-right");
        const answerSingle = document.querySelector("#step-answer-single");
        const fallbackAnswer = (_a = answerLeft != null ? answerLeft : answerRight) != null ? _a : answerSingle;
        if (!fallbackAnswer) {
            console.error("No #step-answer-* template found \u2014 survey cannot render");
            return;
        }
        const translations = await getTranslations(loadFallbackTranslation);
        survey.forEach((question) => {
            var _a2;
            const clone = document.importNode(templateNode.content, true);
            const titleNode = clone.querySelector(".step__title");
            const questionNode = clone.querySelector(".step__question");
            const answersContainerNode = clone.querySelector(".step__answers");
            if (!question.title) console.error("No question title in some option of survey.js");
            if (!question.question) console.error("No question in some option of survey.js");
            if (titleNode) titleNode.textContent = getTranslation(translations, question.title);
            if (questionNode) questionNode.textContent = getTranslation(translations, question.question);
            if (!((_a2 = question.answers) == null ? void 0 : _a2.length)) return console.error("No answers in some option of survey.js");
            if (!answersContainerNode)
                return console.error("No .step__answers container in survey template");
            question.answers.forEach((answer, i) => {
                const positionalPick = (() => {
                    var _a3;
                    if (((_a3 = question.answers) == null ? void 0 : _a3.length) === 1) return answerSingle;
                    if (i % 2 !== 0) return answerRight;
                    return answerLeft;
                })();
                const answerNode = positionalPick != null ? positionalPick : fallbackAnswer;
                if (!answer.text) console.error("Some question answer missed text field in survey.js");
                const answerCloneNode = document.importNode(answerNode.content, true);
                const link = answerCloneNode.querySelector("a");
                if (!link) return console.error("Answer template missing <a> element");
                link.textContent = getTranslation(translations, answer.text);
                answersContainerNode.append(answerCloneNode);
                const {
                    exit: actionType
                } = answer;
                link.addEventListener("click", (evt) => {
                    evt.preventDefault();
                    handleSurveyStep({
                        config,
                        actionType,
                        nextStepNumber: getCurrentStep() + 1,
                        onNextStep: () => onNextStep(evt)
                    });
                });
            });
            surveyStepNodes.push(clone);
        });
        nextStep();
    }
};
generateSurvey();