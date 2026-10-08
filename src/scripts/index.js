// src/scripts/index.js
import { createCard, updateLikes, removeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import { 
  getUserInfo, getCardList, setUserInfo, setUserAvatar, 
  addCard, deleteCardApi, changeLikeCardStatus 
} from "./components/api.js";

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

//  Элементы для статистики
const logoElement = document.querySelector(".header__logo");
const usersStatsModalWindow = document.querySelector(".popup_type_info");
const usersStatsModalInfoList = usersStatsModalWindow.querySelector(".popup__info");
const usersStatsModalUserList = usersStatsModalWindow.querySelector(".popup__list");
const infoDefinitionTemplate = document.querySelector("#popup-info-definition-template").content;
const infoUserPreviewTemplate = document.querySelector("#popup-info-user-preview-template").content;

let currentUserId = null;

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const renderLoading = (isLoading, buttonElement, defaultText = "Сохранить", loadingText = "Сохранение...") => {
  if (isLoading) {
    buttonElement.textContent = loadingText;
  } else {
    buttonElement.textContent = defaultText;
  }
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleLikeCard = (cardId, likeButton, likeCount) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  changeLikeCardStatus(cardId, isLiked)
    .then((cardData) => {
      updateLikes(likeButton, likeCount, cardData.likes, currentUserId);
    })
    .catch((err) => console.log(err));
};

const handleDeleteCard = (cardId, cardElement) => {
  deleteCardApi(cardId)
    .then(() => {
      removeCard(cardElement);
    })
    .catch((err) => console.log(err));
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  renderLoading(true, submitButton);

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => console.log(err))
    .finally(() => renderLoading(false, submitButton));
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  renderLoading(true, submitButton);

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      avatarForm.reset();
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => console.log(err))
    .finally(() => renderLoading(false, submitButton));
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  renderLoading(true, submitButton, "Создать", "Создание...");

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesWrap.prepend(
        createCard(cardData, currentUserId, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCard,
        })
      );
      cardForm.reset();
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => console.log(err))
    .finally(() => renderLoading(false, submitButton, "Создать"));
};

const formatDate = (date) => {
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const createInfoString = (term, description) => {
  const item = infoDefinitionTemplate.querySelector(".popup__info-item").cloneNode(true);
  item.querySelector(".popup__info-term").textContent = term;
  item.querySelector(".popup__info-description").textContent = description;
  return item;
};

const createUserBadge = (name) => {
  const item = infoUserPreviewTemplate.querySelector(".popup__list-item").cloneNode(true);
  item.textContent = name;
  return item;
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      usersStatsModalInfoList.innerHTML = "";
      usersStatsModalUserList.innerHTML = "";

      const userCounts = {};
      const userNames = {};

      cards.forEach((c) => {
        const id = c.owner._id;
        userCounts[id] = (userCounts[id] || 0) + 1;
        userNames[id] = c.owner.name;
      });

      const uniqueUsersCount = Object.keys(userCounts).length;
      const maxCardsCount = Math.max(...Object.values(userCounts));

      usersStatsModalInfoList.append(
        createInfoString("Первая создана:", formatDate(new Date(cards[cards.length - 1].createdAt))),
        createInfoString("Последняя создана:", formatDate(new Date(cards[0].createdAt))),
        createInfoString("Всего пользователей:", uniqueUsersCount),
        createInfoString("Максимум карточек от одного:", maxCardsCount)
      );

      Object.values(userNames).forEach((name) => {
        usersStatsModalUserList.append(createUserBadge(name));
      });

      openModalWindow(usersStatsModalWindow);
    })
    .catch((err) => console.log(err));
};

logoElement.addEventListener("click", handleLogoClick);


Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cardsData]) => {
    currentUserId = userData._id;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cardsData.forEach((cardData) => {
      placesWrap.append(
        createCard(cardData, currentUserId, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCard,
        })
      );
    });
  })
  .catch((err) => console.error(err));

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationSettings);