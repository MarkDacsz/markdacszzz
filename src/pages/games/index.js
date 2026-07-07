import React, { useEffect, useMemo, useState } from 'react';
import './style.css';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Container, Row, Col } from 'react-bootstrap';
import { meta } from '../../content_option';

const cardSymbols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const createDeck = () => {
  const deck = [...cardSymbols, ...cardSymbols]
    .map((symbol) => ({ symbol, id: `${symbol}-${Math.random()}` }))
    .sort(() => Math.random() - 0.5);

  return deck;
};

export const Games = () => {
  const [cards, setCards] = useState(() => createDeck());
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [reactionPhase, setReactionPhase] = useState('idle');
  const [reactionTime, setReactionTime] = useState(null);
  const [reactionMessage, setReactionMessage] = useState('Tap to test your reflexes.');
  const [reactionStartedAt, setReactionStartedAt] = useState(null);

  const isComplete = matchedCards.length === cards.length;

  useEffect(() => {
    if (selectedCards.length !== 2) {
      return undefined;
    }

    const [first, second] = selectedCards;
    if (first.symbol === second.symbol) {
      setMatchedCards((prev) => [...prev, first.id, second.id]);
      setSelectedCards([]);
      setMoves((prev) => prev + 1);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSelectedCards([]);
      setMoves((prev) => prev + 1);
    }, 800);

    return () => window.clearTimeout(timer);
  }, [selectedCards]);

  const handleCardClick = (card) => {
    if (selectedCards.length === 2 || matchedCards.includes(card.id) || selectedCards.some((entry) => entry.id === card.id)) {
      return;
    }

    setSelectedCards((prev) => [...prev, card]);
  };

  const resetMemoryGame = () => {
    setCards(createDeck());
    setSelectedCards([]);
    setMatchedCards([]);
    setMoves(0);
  };

  const startReactionTest = () => {
    setReactionPhase('waiting');
    setReactionMessage('Wait for green...');
    setReactionTime(null);

    window.setTimeout(() => {
      setReactionPhase('ready');
      setReactionMessage('Click now!');
      setReactionStartedAt(Date.now());
    }, 1000 + Math.floor(Math.random() * 1800));
  };

  const handleReactionClick = () => {
    if (reactionPhase === 'ready' && reactionStartedAt) {
      setReactionTime(Date.now() - reactionStartedAt);
      setReactionPhase('done');
      setReactionMessage(`You reacted in ${Date.now() - reactionStartedAt}ms.`);
      return;
    }

    if (reactionPhase === 'waiting') {
      setReactionPhase('idle');
      setReactionMessage('Too soon. Try again.');
    }
  };

  const memoryStatus = useMemo(() => {
    if (isComplete) {
      return 'You completed the board.';
    }
    return `Moves: ${moves}`;
  }, [isComplete, moves]);

  return (
    <HelmetProvider>
      <Container className="About-header games_page">
        <Helmet>
          <meta charSet="utf-8" />
          <title> Mini Games | {meta.title}</title>
          <meta name="description" content={meta.description} />
        </Helmet>

        <Row className="mb-5 mt-3 pt-md-3">
          <Col lg="8">
            <h1 className="display-4 mb-4">Mini Games</h1>
            <hr className="t_border my-4 ml-0 text-left" />
            <p className="mb-0">A lightweight set of themed activities that stay separate from the main portfolio sections.</p>
          </Col>
        </Row>

        <Row className="sec_sp">
          <Col lg="6" className="mb-4">
            <div className="game_card">
              <div className="game_header">
                <h3>Memory Match</h3>
                <button type="button" onClick={resetMemoryGame}>Reset</button>
              </div>
              <p>{memoryStatus}</p>
              <div className="memory_grid">
                {cards.map((card, index) => {
                  const isVisible = matchedCards.includes(card.id) || selectedCards.some((entry) => entry.id === card.id);
                  return (
                    <button
                      key={card.id}
                      type="button"
                      className={`memory_card ${isVisible ? 'is_visible' : ''}`}
                      onClick={() => handleCardClick(card)}
                    >
                      {isVisible ? card.symbol : '?'}
                    </button>
                  );
                })}
              </div>
            </div>
          </Col>

          <Col lg="6">
            <div className="game_card">
              <div className="game_header">
                <h3>Reaction Test</h3>
                <button type="button" onClick={startReactionTest}>Start</button>
              </div>
              <p>{reactionMessage}</p>
              <button type="button" className="reaction_button" onClick={handleReactionClick}>
                {reactionPhase === 'ready' ? 'Click now!' : 'Tap here'}
              </button>
              <p className="reaction_result">{reactionTime ? `Last result: ${reactionTime}ms` : 'No result yet.'}</p>
            </div>
          </Col>
        </Row>
      </Container>
    </HelmetProvider>
  );
};

export default Games;
