import React from 'react';
import styles from './Chat.module.css';

const line = (w = '100%', h = 14) => (
  <div style={{ background: '#eee', borderRadius: 8, height: h, width: w }} />
);

export default function ChatSkeleton() {
  return (
    <section className={styles.container}>
      {/* Sidebar list skeleton */}
      <div className="frame_messages frame_messages__fullchat" style={{ width: 420, minWidth: 320 }}>
        <div className="block_messages font_inter">
          <div className="messages_text">
            <h2>{line('160px', 22)}</h2>
          </div>
          <div className="magnafire df align">
            <div className="magnafire_img" style={{ opacity: 0.3 }}>
              <img src="/img/chat_img/лупа.png" alt="" />
            </div>
            <div className="magnafire_input" style={{ width: '100%' }}>
              {line('100%', 34)}
            </div>
          </div>
        </div>
        <div className="big_messages__wrap">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="big_messages">
              <div className="ilya df font_inter align">
                <div className="ilya_img">
                  <div style={{ width: 66, height: 65, borderRadius: 30, background: '#eee' }} />
                </div>
                <div className="ilya_text" style={{ flex: 1 }}>
                  <h2>{line('60%')}</h2>
                  <h3 className="txt-text-small-ver" style={{ color: '#777' }}>{line('80%')}</h3>
                </div>
                <div className="ilya_text-2">
                  <h2>{line('40px', 14)}</h2>
                </div>
              </div>
              <div className="line_ilya"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area skeleton */}
      <div className={`profil fchat__profile ${styles.profil}`}>
        <div className={`kiril_profil kiril_profil_fchat df font_inter ${styles.profile_top_row}`} style={{ gap: 10 }}>
          <div className={`prof_img chatfgetu twerwe ${styles.profile_row}`}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', right: -4, bottom: -4, background: '#ddd', width: 14, height: 14, borderRadius: 7 }} />
              <div style={{ height: 65, width: 66, borderRadius: 30, background: '#eee' }} />
            </div>
          </div>
          <div className="nik" style={{ flex: 1 }}>
            <h2 className="eyrqwe">{line('180px')}</h2>
            <div className="info_nik df">
              <div className="kiril_info">
                <h3>{line('140px', 14)}</h3>
              </div>
            </div>
          </div>
          <div className={styles.dotted}>
            <div></div><div></div><div></div>
          </div>
        </div>

        <div className={`awqervgg chat_block__ashd ${styles.chatt}`}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`${styles.message_block} ${i % 2 ? styles.text_right : styles.text_left}`} style={{ margin: '12px 0' }}>
              <div className="my_chat">
                <div className="correspondence-active font_inter df" style={{ gap: 10 }}>
                  {i % 2 === 0 && (
                    <div className="ciril-img">
                      <div style={{ width: 40, height: 40, borderRadius: 20, background: '#eee' }} />
                    </div>
                  )}
                  <div className="let" style={{ maxWidth: 560, width: '100%' }}>
                    <div className="letter_kiril df" style={{ gap: 8, justifyContent: i % 2 ? 'flex-end' : 'flex-start' }}>
                      <div className="letter_text-1">
                        <h2 style={{ fontSize: 14, opacity: 0.8 }}>{line('80px', 14)}</h2>
                      </div>
                      <div className="letter_text-2">
                        <h3 style={{ fontSize: 12, opacity: 0.6 }}>{line('50px', 12)}</h3>
                      </div>
                    </div>
                    <div className={styles.block_bid} style={{ padding: '10px 12px' }}>
                      <p>{line('90%')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.message_block}>
          <div className="block_messages-2 font_inter" style={{ paddingTop: 8 }}>
            <div style={{ marginTop: 10 }}>
              {line('100%', 44)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
