import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card.tsx";
import { Button } from "../../components/ui/button.tsx";
import { ThumbsUp, ThumbsDown } from "lucide-react";

function useLikeDislike(initialLikes, initialDislikes, commentId) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const token = localStorage.getItem("token");

  const sendLikeRequest = async (is_like) => {
    const res = await fetch(`http://127.0.0.1:8000/comments/${commentId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ is_like }),
    });

    if (!res.ok) throw new Error("Request failed");
    return res.json();
  };

  const handleLike = () => {
    if (!liked) {
      sendLikeRequest(true)
        .then(() => {
          setLiked(true);
          setLikes((l) => l + 1);
          if (disliked) {
            setDisliked(false);
            setDislikes((d) => d - 1);
          }
        })
        .catch(console.error);
    } else {
      sendLikeRequest(null)
        .then(() => {
          setLiked(false);
          setLikes((l) => l - 1);
        })
        .catch(console.error);
    }
  };

  const handleDislike = () => {
    if (!disliked) {
      sendLikeRequest(false)
        .then(() => {
          setDisliked(true);
          setDislikes((d) => d + 1);
          if (liked) {
            setLiked(false);
            setLikes((l) => l - 1);
          }
        })
        .catch(console.error);
    } else {
      sendLikeRequest(null)
        .then(() => {
          setDisliked(false);
          setDislikes((d) => d - 1);
        })
        .catch(console.error);
    }
  };

  return { likes, dislikes, liked, disliked, handleLike, handleDislike };
}

export function Comment({ comment }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState([]);
  const {
    likes,
    dislikes,
    liked,
    disliked,
    handleLike,
    handleDislike,
  } = useLikeDislike(comment.likes, comment.dislikes, comment.comment_id);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment?.text || reply?.text);

  const handleEditSubmit = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://127.0.0.1:8000/comments/${comment?.comment_id || reply?.comment_id}`, {
      method: "PUT", // or "PATCH" depending on your API
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ text: editText }),
    });
  
    if (res.ok) {
      if (comment) comment.text = editText;
      if (reply) reply.text = editText;
      setIsEditing(false);
    }
  };

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/comments/${comment.comment_id}/replies`)
      .then((res) => res.json())
      .then((data) => setReplies(data));
  }, [comment.comment_id]);

  const handleReplySubmit = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://127.0.0.1:8000/comments/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        post_id: comment.post_id,
        parent_id: comment.comment_id,
        text: replyText,
      }),
    });

    const data = await res.json();
    setReplies([...replies, data]);
    setReplyText("");
    setShowReply(false);
  };

  return (
    <Card className="w-full shadow bg-white">
      <CardContent className="p-4 space-y-2">
        <div className="text-sm text-gray-500">
          {getTimeAgo(comment.created_at)}
        </div>
        {isEditing ? (
  <div className="flex flex-col space-y-2">
    <input
      className="edit-comment border px-2 py-1 rounded"
      value={editText}
      onChange={(e) => setEditText(e.target.value)}
    />
    <Button
      size="sm"
      onClick={handleEditSubmit}
      disabled={editText.trim() === ""}
    >
      Save
    </Button>
    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
      Cancel
    </Button>
  </div>
) : (
  <div className="text-base">{comment?.text || reply?.text}</div>
)}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLike}
            className={liked ? "text-blue-500" : ""}
          >
            <ThumbsUp size={16} /> {likes}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDislike}
            className={disliked ? "text-red-500" : ""}
          >
            <ThumbsDown size={16} /> {dislikes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReply(!showReply)}
          >
            Reply
          </Button>
          <Button
  variant="ghost"
  size="sm"
  onClick={() => setIsEditing(true)}
>
  Edit
</Button>
        </div>
        {showReply && (
          <div className="flex flex-col space-y-2 mt-2">
            <input
              className="write-reply border px-2 py-1 rounded"
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <Button
              className="submit self-start"
              size="sm"
              onClick={handleReplySubmit}
              disabled={replyText.trim() === ""}
            >
              Submit
            </Button>
          </div>
        )}
        <div className="pl-4 border-l-2 mt-2 space-y-2">
          {replies.map((reply) => (
            <ReplyCard key={reply.comment_id} reply={reply} parentAuthor={comment.username} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ReplyCard({ reply, parentAuthor }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState([]);
  const {
    likes,
    dislikes,
    liked,
    disliked,
    handleLike,
    handleDislike,
  } = useLikeDislike(reply.likes, reply.dislikes, reply.comment_id);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment?.text || reply?.text);

    const handleEditSubmit = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://127.0.0.1:8000/comments/${comment?.comment_id || reply?.comment_id}`, {
      method: "PUT", // or "PATCH" depending on your API
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ text: editText }),
    });
  
    if (res.ok) {
      if (comment) comment.text = editText;
      if (reply) reply.text = editText;
      setIsEditing(false);
    }
  };

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/comments/${reply.comment_id}/replies`)
      .then((res) => res.json())
      .then((data) => setReplies(data));
  }, [reply.comment_id]);

  const handleReplySubmit = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://127.0.0.1:8000/comments/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        post_id: reply.post_id,
        parent_id: reply.comment_id,
        text: replyText,
      }),
    });

    const data = await res.json();
    setReplies([...replies, data]);
    setReplyText("");
    setShowReply(false);
  };

  return (
    <Card className="w-full bg-gray-50">
      <CardContent className="p-4 space-y-2">
        <div className="text-sm text-gray-500">
          {getTimeAgo(reply.created_at)} @{reply.parent_id}
        </div>
        {isEditing ? (
  <div className="flex flex-col space-y-2">
    <input
      className="edit-comment border px-2 py-1 rounded"
      value={editText}
      onChange={(e) => setEditText(e.target.value)}
    />
    <Button
      size="sm"
      onClick={handleEditSubmit}
      disabled={editText.trim() === ""}
    >
      Save
    </Button>
    <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
      Cancel
    </Button>
  </div>
) : (
  <div className="text-base">{comment?.text || reply?.text}</div>
)}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLike}
            className={liked ? "text-blue-500" : ""}
          >
            <ThumbsUp size={16} /> {likes}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDislike}
            className={disliked ? "text-red-500" : ""}
          >
            <ThumbsDown size={16} /> {dislikes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReply(!showReply)}
          >
            Reply
          </Button>
          <Button
  variant="ghost"
  size="sm"
  onClick={() => setIsEditing(true)}
>
  Edit
</Button>
        </div>
        {showReply && (
          <div className="flex flex-col space-y-2 mt-2">
            <input
              className="write-reply border px-2 py-1 rounded"
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <Button
              className="submit self-start"
              size="sm"
              onClick={handleReplySubmit}
              disabled={replyText.trim() === ""}
            >
              Submit
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const units = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ];

  for (const { unit, seconds: unitSeconds } of units) {
    const delta = Math.floor(seconds / unitSeconds);
    if (delta >= 1) return rtf.format(-delta, unit);
  }
  return "just now";
}

