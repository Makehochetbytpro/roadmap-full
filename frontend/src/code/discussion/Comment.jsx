import { useState, useEffect, useRef } from 'react';
import './Discussion.css';
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

function Comment({ theme = "light" }) {
  const [comments, setComments] = useState([]);
  const likedIcon = theme == "dark" ? likedIconWhite : likedIconBlack;
  const dislikedIcon = theme == "dark" ? dislikedIconWhite : dislikedIconBlack;
  const likeIcon = theme == "dark" ? likeIconWhite : likeIconBlack;
  const dislikeIcon = theme == "dark" ? dislikeIconWhite : dislikeIconBlack;

  const upArrow = theme == "dark" ? upArrowWhite : upArrowBlack;
  const downArrow = theme == "dark" ? downArrowWhite : downArrowBlack;
  const [replyText, setReplyText] = useState("");
  const [writeReply, setWriteReply] = useState(false);

  const fetchComments = () => {
    fetch("http://127.0.0.1:8000/comments_tree/1", {
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setComments(data);
      })
      .catch((err) => console.error('Failed to fetch comments', err));
  };
  
  useEffect(() => {
    fetchComments(); 
  }, []);

  const formatNumber = (num) => {
    if (!num) return "";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  const buttonRef = useRef();

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      buttonRef.current.click();
    }
  };

  const CommentCard = ({ comment }) => {
    const [likes, setLikes] = useState(comment.likes || 0);
    const [dislikes, setDislikes] = useState(comment.dislikes || 0);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [writeReply, setWriteReply] = useState(false);
    const [replyText, setReplyText] = useState("");

    const handleLike = (id) => {
      if (!liked) {
        fetch(`http://127.0.0.1:8000/comments/${id}/like`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
            body: JSON.stringify({ is_like: true })
        })
        .then(response => {
            if(response.ok) {
                setLiked(true);
                setLikes(likes + 1);
                if (disliked) {
                  setDisliked(false);
                  setDislikes(dislikes - 1);
                }
            }
            if(!response.ok) {
                throw new Error("Like request failed");
            }
            return response.json()
        })
        .then(data => {
            console.log("Like response:" + data);
        })
        .catch(error => {
            console.log("Error liking comment: " + error);
        });
      } else {
        fetch(`http://127.0.0.1:8000/comments/${id}/like`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("token"),
            },
            body: JSON.stringify({ is_like: null })
        })
        .then(response => {
            if(response.ok) {
                setLiked(false);
                setLikes(likes - 1);
            }
            if(!response.ok) {
                throw new Error("Unlike request failed");
            }
            return response.json()
        })
        .then(data => {
            console.log("Unlike response:" + data);
        })
        .catch(error => {
            console.log("Error unliking comment: " + error);
        });
      }
    };

    const handleDislike = (id) => {
        if (!disliked) {
          fetch(`http://127.0.0.1:8000/comments/${id}/like`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token"),
              },
              body: JSON.stringify({ is_like: false })
          })
          .then(response => {
              if(response.ok) {
                  setDisliked(true);
                  setDislikes(dislikes + 1);
                  if (liked) {
                    setLiked(false);
                    setLikes(likes - 1);
                  }
              }
              if(!response.ok) {
                  throw new Error("Dislike request failed");
              }
              return response.json()
          })
          .then(data => {
              console.log("Dislike response:" + data);
          })
          .catch(error => {
              console.log("Error disliking comment: " + error);
          });
        } else {
          fetch(`http://127.0.0.1:8000/comments/${id}/like`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token"),
              },
              body: JSON.stringify({ is_like: null })
          })
          .then(response => {
              if(response.ok) {
                  setDisliked(false);
                  setDislikes(dislikes - 1);
              }
              if(!response.ok) {
                  throw new Error("Undislike request failed");
              }
              return response.json()
          })
          .then(data => {
              console.log("Undislike response:" + data);
          })
          .catch(error => {
              console.log("Error undisliking comment: " + error);
          });
        }
    };

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
      <div className='comment-container'>
        <div className='profile-picture'></div>
        <div className='comment'>
          <div className='comment-info'>
            <div className='comment-author'>{comment.username}</div>
            <div className='comment-date'>{getTimeAgo(comment.date)}</div>
          </div>
          <div className='comment-text'>{comment.text}</div>
          <div className='feedback'>
            <img src={liked ? likedIcon : likeIcon} className='like-icon' onClick={() => handleLike(comment.comment_id)} alt="like" />
            <div className='num-of-likes'>{formatNumber(likes)}</div>
            <img src={disliked ? dislikedIcon : dislikeIcon} className='dislike-icon' onClick={() => handleDislike(comment.comment_id)} alt="dislike" />
            <div className='num-of-dislikes'>{formatNumber(dislikes)}</div>
            <div className='reply-button' onClick={() => setWriteReply(true)}>Reply</div>
          </div>

          {writeReply && (
            <div className='write-reply-container'>
            <div className='profile-picture'></div>
              <div className='write-reply-submit'>
                  <input
                    className='write-reply'
                    placeholder='Write a reply...'
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className='submit-buttons'>
                    <div className='cancel' onClick={() => setWriteReply(false)}>
                      Cancel
                    </div>
                    <button
                      className={`submit ${replyText.trim() === "" ? "disabled" : ""}`}
                      onClick={async () => {
                        if (replyText.trim() === "") return;
                        try {
                          const response = await fetch('http://127.0.0.1:8000/comments/', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: "Bearer " + localStorage.getItem("token")
                            },
                            body: JSON.stringify({
                              topic_id: 1,
                              parent_comment_id: comment.comment_id,
                              content: replyText
                            }),
                          });
  
                          if (!response.ok) {
                            throw new Error('Failed to submit comment');
                          }
  
                          const result = await response.json(); 
                          setReplyText("");
                          setWriteReply(false);
                          fetchComments();
                        } catch (error) {
                          console.error("Error posting comment:", error);
                        }
                      }}
                    >
                      Comment
                    </button>
                  </div>
              </div>
            </div>
          )}

            {comment.reply && comment.reply.length > 0 && (
            <>
                <div className='contains-reply-container' onClick={() => setShowReplies(!showReplies)}>
                <img src={showReplies ? upArrow : downArrow} className='down-arrow' alt="toggle replies" />
                <div className='reply-number'>{flattenReplies(comment.reply).length} Replies</div>
                </div>
                {showReplies && (
                <div className='replies-container'>
                    {flattenReplies(comment.reply).map((reply) => (
                    <ReplyCard key={reply.comment_id} reply={reply} />
                    ))}
                </div>
                )}
            </>
            )}
        </div>
      </div>
    );
  };

  const ReplyCard = ({ reply }) => {
    const [likes, setLikes] = useState(reply.likes || 0);
    const [dislikes, setDislikes] = useState(reply.dislikes || 0);
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [writeReply, setWriteReply] = useState(false);
    const [replyText, setReplyText] = useState("");
  
    const handleLike = (id) => {
        if (!liked) {
          fetch(`http://127.0.0.1:8000/comments/${id}/like`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token"),
              },
              body: JSON.stringify({ is_like: true })
          })
          .then(response => {
              if(response.ok) {
                  setLiked(true);
                  setLikes(likes + 1);
                  if (disliked) {
                    setDisliked(false);
                    setDislikes(dislikes - 1);
                  }
              }
              if(!response.ok) {
                  throw new Error("Like request failed");
              }
              return response.json()
          })
          .then(data => {
              console.log("Like response:" + data);
          })
          .catch(error => {
              console.log("Error liking comment: " + error);
          });
        } else {
          fetch(`http://127.0.0.1:8000/comments/${id}/like`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token"),
              },
              body: JSON.stringify({ is_like: null })
          })
          .then(response => {
              if(response.ok) {
                  setLiked(false);
                  setLikes(likes - 1);
              }
              if(!response.ok) {
                  throw new Error("Unlike request failed");
              }
              return response.json()
          })
          .then(data => {
              console.log("Unlike response:" + data);
          })
          .catch(error => {
              console.log("Error unliking comment: " + error);
          });
        }
    };
  
    const handleDislike = (id) => {
        if (!disliked) {
          fetch(`http://127.0.0.1:8000/comments/${id}/like`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token"),
              },
              body: JSON.stringify({ is_like: false })
          })
          .then(response => {
              if(response.ok) {
                  setDisliked(true);
                  setDislikes(dislikes + 1);
                  if (liked) {
                    setLiked(false);
                    setLikes(likes - 1);
                  }
              }
              if(!response.ok) {
                  throw new Error("Dislike request failed");
              }
              return response.json()
          })
          .then(data => {
              console.log("Dislike response:" + data);
          })
          .catch(error => {
              console.log("Error disliking comment: " + error);
          });
        } else {
          fetch(`http://127.0.0.1:8000/comments/${id}/like`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token"),
              },
              body: JSON.stringify({ is_like: null })
          })
          .then(response => {
              if(response.ok) {
                  setDisliked(false);
                  setDislikes(dislikes - 1);
              }
              if(!response.ok) {
                  throw new Error("Undislike request failed");
              }
              return response.json()
          })
          .then(data => {
              console.log("Undislike response:" + data);
          })
          .catch(error => {
              console.log("Error undisliking comment: " + error);
          });
        }
    };
  
    return (
      <div className='comment-container reply-container'>
        <div className='reply-profile-picture'></div>
        <div className='reply'>
          <div className='comment-info'>
            <div className='comment-author'>User {reply.user_id}</div>
            <div className='comment-date'>{getTimeAgo(reply.date)}</div>
          </div>
          <div className='comment-text'>
            <span className='tagged-user'>@{reply.parent_id}</span> {reply.text}
          </div>
          <div className='feedback'>
            <img src={liked ? likedIcon : likeIcon} className='like-icon' onClick={() => handleLike(reply.comment_id)} alt="like" />
            <div className='num-of-likes'>{formatNumber(likes)}</div>
            <img src={disliked ? dislikedIcon : dislikeIcon} className='dislike-icon' onClick={() => handleDislike(reply.comment_id)} alt="dislike" />
            <div className='num-of-dislikes'>{formatNumber(dislikes)}</div>
            <div className='reply-button' onClick={() => setWriteReply(true)}>Reply</div>
          </div>

          {writeReply && (
            <div className='write-reply-container'>
            <div className='profile-picture'></div>
              <div className='write-reply-submit'>
                  <input
                    className='write-reply'
                    placeholder='Write a reply...'
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className='submit-buttons'>
                    <div className='cancel' onClick={() => setWriteReply(false)}>
                      Cancel
                    </div>
                    <div
                      className={`submit ${replyText.trim() === "" ? "disabled" : ""}`}
                      onClick={async () => {
                        if (replyText.trim() === "") return;
                        try {
                          const response = await fetch('http://127.0.0.1:8000/comments/', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: "Bearer " + localStorage.getItem("token")
                            },
                            body: JSON.stringify({
                              topic_id: 1,
                              parent_comment_id: reply.comment_id,
                              content: replyText
                            }),
                          });
  
                          if (!response.ok) {
                            throw new Error('Failed to submit comment');
                          }
  
                          const result = await response.json(); 
                          setReplyText("");
                          setWriteReply(false);
                          fetchComments();
                        } catch (error) {
                          console.error("Error posting comment:", error);
                        }
                      }}
                    >
                      Comment
                    </div>
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
                <input
                  className='write-reply'
                  placeholder='Add comment...'
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                />
                <div className='submit-buttons'>
                  <div className='cancel' onClick={() => setWriteReply(false)}>
                    Cancel
                  </div>
                  <button
                    className={`submit ${replyText.trim() === "" ? "disabled" : ""}`}
                    ref={buttonRef}
                    onClick={async () => {
                      if (replyText.trim() === "") return;
                      try {
                        const response = await fetch('http://127.0.0.1:8000/comments/', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: "Bearer " + localStorage.getItem("token")
                          },
                          body: JSON.stringify({
                            topic_id: 1,
                            content: replyText
                          }),
                        });

                        if (!response.ok) {
                          throw new Error('Failed to submit comment');
                        }

                        const result = await response.json(); 
                        setReplyText("");
                        setWriteReply(false);
                        fetchComments();
                      } catch (error) {
                        console.error("Error posting comment:", error);
                      }
                    }}
                  >
                    Comment
                  </button>
                </div>
            </div>
        </div>

      <div className='comments-container'>
        {comments.map((comment) => (
          <CommentCard key={comment.comment_id} comment={comment} />
        ))}
      </div>
    </div>
  );
}

export default Comment;
