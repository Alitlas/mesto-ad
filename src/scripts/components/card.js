// src/scripts/components/card.js

export const createCard = (cardData, userId, { onPreviewPicture, onLikeIcon, onDeleteCard }) => {
  const cardTemplate = document.querySelector("#card-template").content;
  const cardElement = cardTemplate.querySelector(".card").cloneNode(true);
  
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__like-count");

  // Заполнение
  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardTitle.textContent = cardData.name;

  // Отрисовка сердешек
  updateLikes(likeButton, likeCount, cardData.likes, userId);

  // Проверка владельца
  if (cardData.owner._id !== userId) {
    deleteButton.remove();
  } else {
    deleteButton.addEventListener("click", () => onDeleteCard(cardData._id, cardElement));
  }

  likeButton.addEventListener("click", () => onLikeIcon(cardData._id, likeButton, likeCount));
  cardImage.addEventListener("click", () => onPreviewPicture({ name: cardData.name, link: cardData.link }));

  return cardElement;
};

// обновление интерфейса лайков
export const updateLikes = (likeButton, likeCount, likesArray, userId) => {
  likeCount.textContent = likesArray.length;
  if (likesArray.some((user) => user._id === userId)) {
    likeButton.classList.add("card__like-button_is-active"); // Поменяй класс, если у тебя он называется иначе
  } else {
    likeButton.classList.remove("card__like-button_is-active");
  }
};