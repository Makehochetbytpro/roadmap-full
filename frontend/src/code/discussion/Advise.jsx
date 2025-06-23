import { useState, useRef } from 'react';
import './Discussion1.css';
import likeIconWhite from '../../assets/like-white.png';
import dislikeIconWhite from '../../assets/dislike-white.png';
import likedIconWhite from '../../assets/liked-white.png';
import dislikedIconWhite from '../../assets/disliked-white.png';
import likeIconBlack from '../../assets/like-black.png';
import dislikeIconBlack from '../../assets/dislike-black.png';
import likedIconBlack from '../../assets/liked-black.png';
import dislikedIconBlack from '../../assets/disliked-black.png';
import downArrowWhite from '../../assets/down-arrow-white.png';
import upArrowWhite from '../../assets/up-arrow-white.png';
import downArrowBlack from '../../assets/down-arrow-black.png';
import upArrowBlack from '../../assets/up-arrow-black.png';

function Advise({ theme = "light" }) {
  const [advises, setAdvises] = useState([
    {
      comment_id: 1,
      user_id: 1,
      text: "This is an advise.",
      date: "2023-10-01T12:00:00Z",
      likes: 5,
      dislikes: 2,
      type: "advise",
      reply: [
        {
          comment_id: 2,
          user_id: 2,
          text: "This is a question about the advise.",
          date: "2023-10-01T12:05:00Z",
          likes: 3,
          dislikes: 1,
          type: "question",
          reply: [
            {
              comment_id: 4,
              user_id: 1,
              text: "This is an answer to the question.",
              date: "2023-10-01T12:10:00Z",
              likes: 1,
              dislikes: 0,
              type: "reply",
              reply: []
            }
          ]
        }
      ]
    },
    {
      comment_id: 3,
      user_id: 3,
      text: "This is another advise.",
      date: "2023-10-01T12:15:00Z",
      likes: 4,
      dislikes: 1,
      type: "advise",
      reply: []
    }
  ]);
  const [userVotes, setUserVotes] = useState({});
  const [replyText, setReplyText] = useState("");
  const [postType, setPostType] = useState("advise");
  const nextId = useRef(5);

  const likedIcon = theme === "dark" ? likedIconWhite : likedIconBlack;
  const dislikedIcon = theme === "dark" ? dislikedIconWhite : dislikedIconBlack;
  const likeIcon = theme === "dark" ? likeIconWhite : likeIconBlack;
  const dislikeIcon = theme === "dark" ? dislikeIconWhite : dislikeIconBlack;
  const upArrow = theme === "dark" ? upArrowWhite : upArrowBlack;
  const downArrow = theme === "dark" ? downArrowWhite : downArrowBlack;

  const getUsername = (user_id) => {
    const userMap = {
      1: "meirambek",
      2: "aibar_best",
      3: "aibar1",
      4: "nurdaulet",
      999: "aibar1"
    };
    return userMap[user_id] || "Unknown";
  };

  const formatNumber = (num) => {
    if (!num) return "";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  const findComment = (advises, commentId) => {
    for (let advise of advises) {
      if (advise.comment_id === commentId) return advise;
      if (advise.reply && advise.reply.length > 0) {
        const found = findComment(advise.reply, commentId);
        if (found) return found;
      }
    }
    return null;
  };

  const toggleVote = (commentId, voteType) => {
    setUserVotes(prevUserVotes => {
      const currentVote = prevUserVotes[commentId] || null;
      let newVote;
      if (voteType === 'like') {
        newVote = currentVote === 'like' ? null : 'like';
      } else if (voteType === 'dislike') {
        newVote = currentVote === 'dislike' ? null : 'dislike';
      } else {
        return prevUserVotes;
      }

      setAdvises(prevAdvises => {
        const newAdvises = JSON.parse(JSON.stringify(prevAdvises));
        const comment = findComment(newAdvises, commentId);
        if (!comment) return prevAdvises;

        if (currentVote === 'like') {
          comment.likes -= 1;
        } else if (currentVote === 'dislike') {
          comment.dislikes -= 1;
        }
        if (newVote === 'like') {
          comment.likes += 1;
        } else if (newVote === 'dislike') {
          comment.dislikes += 1;
        }
        return newAdvises;
      });

      return { ...prevUserVotes, [commentId]: newVote };
    });
  };

  const addPost = (text, type) => {
    const newAdvise = {
      comment_id: nextId.current++,
      user_id: 999,
      text,
      date: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      type,
      reply: []
    };
    setAdvises(prev => [...prev, newAdvise]);
    setReplyText("");
  };

  const addReply = (parentId, text, type) => {
    setAdvises(prevAdvises => {
      const newAdvises = JSON.parse(JSON.stringify(prevAdvises));
      const parentComment = findComment(newAdvises, parentId);
      if (parentComment) {
        const newReply = {
          comment_id: nextId.current++,
          user_id: 999,
          text,
          date: new Date().toISOString(),
          likes: 0,
          dislikes: 0,
          type,
          reply: []
        };
        parentComment.reply = parentComment.reply || [];
        parentComment.reply.push(newReply);
      }
      return newAdvises;
    });
  };

  const AdviseCard = ({ advise, userVote, onVote, addReply }) => {
    const [showReplies, setShowReplies] = useState(false);
    const [writeReply, setWriteReply] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [replyType, setReplyType] = useState("reply");

    const flattenReplies = (replies = []) => {
      let result = [];
      const stack = [...replies];
      while (stack.length > 0) {
        const reply = stack.shift();
        result.push(reply);
        if (reply.reply && reply.reply.length > 0) {
          stack.unshift(...reply.reply);
        }
      }
      return result;
    };

    return (
      <div className='advise-container'>
        <div className='profile-picture'></div>
        <div className='advise'>
          <div className='advise-info'>
            <div className='advise-type'>[{advise.type.toUpperCase()}]</div>
            <div className='advise-author'>Advisor {getUsername(advise.user_id)}</div>
            <div className='advise-date'>{getTimeAgo(advise.date)}</div>
          </div>
          <div className='advise-text'>{advise.text}</div>
          <div className='feedback'>
            <img src={userVote === 'like' ? likedIcon : likeIcon} className='like-icon' onClick={() => onVote(advise.comment_id, 'like')} alt="like" />
            <div className='num-of-likes'>{formatNumber(advise.likes)}</div>
            <img src={userVote === 'dislike' ? dislikedIcon : dislikeIcon} className='dislike-icon' onClick={() => onVote(advise.comment_id, 'dislike')} alt="dislike" />
            <div className='num-of-dislikes'>{formatNumber(advise.dislikes)}</div>
            <div className='reply-button' onClick={() => setWriteReply(true)}>Respond</div>
          </div>

          {writeReply && (
            <div className='write-reply-container'>
              <div className='profile-picture'></div>
              <div className='write-reply-submit'>
                <div className='input-row'>
                  <select value={replyType} onChange={(e) => setReplyType(e.target.value)} className="post-type-select">
                    <option value="reply">Reply</option>
                    <option value="advise">Advise</option>
                    <option value="question">Question</option>
                  </select>
                  <input
                    className='write-reply'
                    placeholder='Write a response...'
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                </div>
                <div className='submit-buttons'>
                  <div className='cancel' onClick={() => setWriteReply(false)}>Cancel</div>
                  <button
                    className={`submit ${replyText.trim() === "" ? "disabled" : ""}`}
                    onClick={() => {
                      if (replyText.trim() === "") return;
                      addReply(advise.comment_id, replyText, replyType);
                      setReplyText("");
                      setWriteReply(false);
                    }}
                  >
                    Respond
                  </button>
                </div>
              </div>
            </div>
          )}

          {advise.reply && advise.reply.length > 0 && (
            <>
              <div className='contains-reply-container' onClick={() => setShowReplies(!showReplies)}>
                <img src={showReplies ? upArrow : downArrow} className='down-arrow' alt="toggle responses" />
                <div className='reply-number'>{flattenReplies(advise.reply).length} Responses</div>
              </div>
              {showReplies && (
                <div className='responses-container'>
                  {flattenReplies(advise.reply).map((response) => (
                    <ResponseCard
                      key={response.comment_id}
                      response={response}
                      userVote={userVotes[response.comment_id] || null}
                      onVote={onVote}
                      addReply={addReply}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const ResponseCard = ({ response, userVote, onVote, addReply }) => {
    const [writeReply, setWriteReply] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [replyType, setReplyType] = useState("reply");

    return (
      <div className='advise-container response-container'>
        <div className='response-profile-picture'></div>
        <div className='response'>
          <div className='advise-info'>
            <div className='advise-type'>[{response.type.toUpperCase()}]</div>
            <div className='advise-author'>Responder {getUsername(response.user_id)}</div>
            <div className='advise-date'>{getTimeAgo(response.date)}</div>
          </div>
          <div className='advise-text'>{response.text}</div>
          <div className='feedback'>
            <img src={userVote === 'like' ? likedIcon : likeIcon} className='like-icon' onClick={() => onVote(response.comment_id, 'like')} alt="like" />
            <div className='num-of-likes'>{formatNumber(response.likes)}</div>
            <img src={userVote === 'dislike' ? dislikedIcon : dislikeIcon} className='dislike-icon' onClick={() => onVote(response.comment_id, 'dislike')} alt="dislike" />
            <div className='num-of-dislikes'>{formatNumber(response.dislikes)}</div>
            <div className='reply-button' onClick={() => setWriteReply(true)}>Respond</div>
          </div>

          {writeReply && (
            <div className='write-reply-container'>
              <div className='profile-picture'></div>
              <div className='write-reply-submit'>
                <div className='input-row'>
                  <select value={replyType} onChange={(e) => setReplyType(e.target.value)} className="post-type-select">
                    <option value="reply">Reply</option>
                    <option value="advise">Advise</option>
                    <option value="question">Question</option>
                  </select>
                  <input
                    className='write-reply'
                    placeholder='Write a response...'
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                </div>
                <div className='submit-buttons'>
                  <div className='cancel' onClick={() => setWriteReply(false)}>Cancel</div>
                  <button
                    className={`submit ${replyText.trim() === "" ? "disabled" : ""}`}
                    onClick={() => {
                      if (replyText.trim() === "") return;
                      addReply(response.comment_id, replyText, replyType);
                      setReplyText("");
                      setWriteReply(false);
                    }}
                  >
                    Respond
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const secondsAgo = Math.floor((now - past) / 1000);

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 },
    ];

    for (let i = 0; i < intervals.length; i++) {
      const interval = intervals[i];
      const count = Math.floor(secondsAgo / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
      }
    }
    return 'just now';
  };

  return (
    <div className={`some-discussion-container ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
      <div className='write-reply-container'>
        <div className='profile-picture'></div>
        <div className='write-reply-submit'>
          <div className='input-row'>
            <select value={postType} onChange={(e) => setPostType(e.target.value)} className="post-type-select">
              <option value="advise">Advise</option>
              <option value="question">Question</option>
            </select>
            <input
              className='write-reply'
              placeholder='Share your advice or ask a question...'
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
          </div>
          <div className='submit-buttons'>
            <div className='cancel' onClick={() => setReplyText("")}>Cancel</div>
            <button
              className={`submit ${replyText.trim() === "" ? "disabled" : ""}`}
              onClick={() => {
                if (replyText.trim() === "") return;
                addPost(replyText, postType);
              }}
            >
              Post
            </button>
          </div>
        </div>
      </div>

      <div className='advises-container'>
        {advises.map((advise) => (
          <AdviseCard
            key={advise.comment_id}
            advise={advise}
            userVote={userVotes[advise.comment_id] || null}
            onVote={toggleVote}
            addReply={addReply}
          />
        ))}
      </div>
    </div>
  );
}

export default Advise;