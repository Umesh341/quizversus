
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export  function generateQuestion() {
  const types = ['+', '-', '*', '/'];
  const type = types[getRandomInt(0, types.length - 1)];
  let a = getRandomInt(10, 200);
  let b = getRandomInt(10, 20);

  if (type === '/') {
    b = getRandomInt(1, 10);
    a = b * getRandomInt(1, 10);
  }

  let question = `${a} ${type} ${b}`;
  let answer = eval(question);

  if (type === '/') answer = Math.floor(answer);

  let options = [answer];
  while (options.length < 4) {
    let fake = answer + getRandomInt(-10, 10);
    if (!options.includes(fake)) options.push(fake);
  }
  options = options.sort(() => Math.random() - 0.5);

  return { question, answer, options };
}