import { Injectable } from '@angular/core';
import { DataHandlerService } from './data.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CacheService } from './cache.service';
import { Survey, Question, Choice } from '../interfaces/survey';
import { SecureRandString } from '../utils/rand';

const host = environment.host;
const fileHost = environment.fileHost;

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  constructor(private http: HttpClient, private dataHandler: DataHandlerService, private cache: CacheService) { }

  validate(obj: any) {
    if (obj.code === 200 && obj.data !== null && obj.data !== {} && obj.data !== [] && obj.data.length !== 0
      && Object.keys(obj.data).length !== 0) {
      return true;
    }
    return false;
  }

  create(survey: Survey, upload?: any) {
    let form = new FormData();
    return new Promise((resolve, reject) => {
      if (upload) {
        form.append('file', upload);
        form.append('tag', SecureRandString());
        form.append('title', SecureRandString());
        form.append('overwrite', 'true');

        this.http.post(`${host}/upload/upload`, form).subscribe((data: any) => {
          if (this.validate(data) === true) {
            form = new FormData();
            form.append('title', survey.title);
            form.append('description', survey.description);
            form.append('store_type', survey.store_type);
            form.append('status', survey.status);
            form.append('user_id', survey.user_id);
            form.append('manufacturer_id', survey.manufacturer_id);
            form.append('reward_points', survey.reward_points.toString());
            form.append('reward_wallet', survey.reward_wallet.toString());
            form.append('upload_id', data.data);

            // tslint:disable-next-line
            this.http.post(`${host}/survey/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
              if (data.code === 200) {
                resolve();
              } else {
                reject(data);
              }
            }, error => {
              reject(error);
            });
          } else {
            reject(data);
          }
        }, error => {
          reject(error);
        });
      } else {
        form = new FormData();
        form.append('title', survey.title);
        form.append('description', survey.description);
        form.append('store_type', survey.store_type);
        form.append('status', survey.status);
        form.append('user_id', survey.user_id);
        form.append('manufacturer_id', survey.manufacturer_id);
        form.append('reward_points', survey.reward_points.toString());
        form.append('reward_wallet', survey.reward_wallet.toString());
        form.append('upload_id', '-');

        // tslint:disable-next-line
        this.http.post(`${host}/survey/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
          if (data.code === 200) {
            resolve();
          } else {
            reject(data);
          }
        }, error => {
          reject(error);
        });
      }
    });
  }

  edit(survey: Survey, currentSurvey: any, upload?: any) {
    let form = new FormData();

    return new Promise((resolve, reject) => {
      if (upload) {
        form.append('file', upload);
        form.append('tag', SecureRandString());
        form.append('title', SecureRandString());
        form.append('overwrite', 'true');

        this.http.post(`${host}/upload/upload`, form).subscribe((data: any) => {
          if (this.validate(data) === true) {
            form = new FormData();
            form.append('_id', currentSurvey._id);
            form.append('title', survey.title);
            form.append('description', survey.description);
            form.append('store_type', survey.store_type);
            form.append('status', survey.status);
            form.append('user_id', survey.user_id);
            form.append('manufacturer_id', survey.manufacturer_id);
            form.append('reward_points', survey.reward_points.toString());
            form.append('reward_wallet', survey.reward_wallet.toString());
            form.append('upload_id', data.data);

            // tslint:disable-next-line
            this.http.post(`${host}/survey/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
              if (data.code === 200) {
                resolve();
              } else {
                reject(data);
              }
            }, error => {
              reject(error);
            });
          } else {
            reject(data);
          }
        }, error => {
          reject(error);
        });
      } else {
        form = new FormData();
        form.append('_id', currentSurvey._id);
        form.append('title', survey.title);
        form.append('description', survey.description);
        form.append('store_type', survey.store_type);
        form.append('status', survey.status);
        form.append('user_id', survey.user_id);
        form.append('manufacturer_id', survey.manufacturer_id);
        form.append('reward_points', survey.reward_points.toString());
        form.append('reward_wallet', survey.reward_wallet.toString());
        form.append('upload_id', currentSurvey.upload_id);

        // tslint:disable-next-line
        this.http.post(`${host}/survey/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
          if (data.code === 200) {
            resolve();
          } else {
            reject(data);
          }
        }, error => {
          reject(error);
        });
      }
    });
  }

  addQuestion(question: Question, choices?: Array<Choice>, upload?: any) {
    let form = new FormData();

    return new Promise((resolve, reject) => {
      if (upload) {
        form.append('file', upload);
        form.append('tag', SecureRandString());
        form.append('title', SecureRandString());
        form.append('overwrite', 'true');

        this.http.post(`${host}/upload/upload`, form).subscribe((data: any) => {
          if (this.validate(data) === true) {
            form = new FormData();
            form.append('type', question.type);
            form.append('title', question.title);
            form.append('index', question.index.toString());
            form.append('status', question.status);
            form.append('survey_id', question.survey_id);
            form.append('upload_id', data.data);

            // tslint:disable-next-line
            this.http.post(`${host}/question/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
              console.log(data);
              if (data.code === 200) {
                const question_id = data.data;
                if (choices) {
                  choices.map((choice) => {
                    form = new FormData();
                    form.append('title', choice.title);
                    form.append('index', choice.index.toString());
                    form.append('status', choice.status);
                    form.append('question_id', question_id);

                    // tslint:disable-next-line
                    this.http.post(`${host}/choice/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                      if (data.code === 200) {
                        // do nothing
                      } else {
                        // console.log(data);
                      }
                    }, error => {
                      reject(error);
                    });
                  });
                  resolve();
                } else {
                  resolve();
                }
              } else {
                reject(data);
              }
            }, error => {
              reject(error);
            });
          } else {
            reject(data);
          }
        }, error => {
          reject(error);
        });
      } else {
        form.append('type', question.type);
        form.append('title', question.title);
        form.append('index', question.index.toString());
        form.append('status', question.status);
        form.append('survey_id', question.survey_id);
        form.append('upload_id', '-');
        this.http.post(`${host}/question/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
          console.log(data);
          if (data.code === 200) {
            const question_id = data.data;
            if (choices) {
              choices.map((choice) => {
                form = new FormData();
                form.append('title', choice.title);
                form.append('index', choice.index.toString());
                form.append('status', choice.status);
                form.append('question_id', question_id);

                // tslint:disable-next-line
                this.http.post(`${host}/choice/create`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                  if (data.code === 200) {
                    // do nothing
                  } else {
                    // console.log(data);
                  }
                }, error => {
                  reject(error);
                });
              });
              resolve();
            } else {
              resolve();
            }
          } else {
            reject(data);
          }
        }, error => {
          reject(error);
        });
      }
    });
  }

  fetchLite(manufacturer_id: string) {
    const form = new FormData();
    form.append('manufacturer_id', manufacturer_id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/survey/read_by_manufacturer`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          resolve(data.data);
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchAll(manufacturer_id: string) {
    const form = new FormData();
    form.append('manufacturer_id', manufacturer_id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/survey/read_by_manufacturer`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          let surveys = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/upload/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200 && data.data.length !== 0) {
              const uploads = data.data;
              // tslint:disable-next-line
              this.http.get(`${host}/answer/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                if (data.code === 200) {
                  const answers = data.data;
                  // tslint:disable-next-line
                  this.http.get(`${host}/buyer/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                    if (data.code === 200) {
                      const buyers = data.data;
                      surveys.map((survey) => {
                        let responses = 0;
                        buyers.map((buyer) => {
                          const buyerResponses = answers.filter((answer) => answer.survey_id === survey._id &&
                            answer.buyer_id === buyer._id);
                          buyerResponses.length > 0 ? responses += 1 : responses = responses;
                        });
                        survey.responses = responses;
                        survey.upload_id !== '-' ? survey.image = `${fileHost}${uploads.find((upload: any) => {
                          return upload._id === survey.upload_id;
                        }).path}` : survey.image = null;
                      });
                      surveys = surveys.sort(function(a, b) {
                        const A = a.title.toLowerCase(), B = b.title.toLowerCase();
                        if (A < B) {
                          return -1;
                        }
                        if (A > B) {
                          return 1;
                        }
                        return 0;
                      });
                      console.log(surveys);
                      this.cache.setSurveys(surveys);
                      resolve(surveys);
                    } else {
                      reject(data);
                    }
                  }, error => {
                    reject(error);
                  });
                } else {
                  reject(data);
                }
              }, error => {
                reject(error);
              });
            } else {
              reject(data);
            }
          });
        } else if (data.code === 200 && data.data.length === 0) {
          this.cache.setSurveys([]);
          resolve([]);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchSingleSurvey(id: string) {
    const form = new FormData();
    form.append('_id', id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/survey/read`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          const surveys = data.data;
          console.log(surveys);
          resolve(surveys);
        } else if (data.code === 200 && data.data.length === 0) {
          resolve([]);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchSurveyBody(survey_id: string) {
    const form = new FormData();
    form.append('survey_id', survey_id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/question/read_by_survey`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        console.log(data);
        if (data.code === 200 && data.data.length !== 0) {
          const questions: Array<any> = data.data.sort((a, b) => {
            if (a.index < b.index) {
              return -1;
            }
            if (a.index > b.index) {
              return 1;
            }
            return 0;
          });

          // tslint:disable-next-line
          this.http.get(`${host}/upload/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            console.log(data);
            if (data.code === 200) {
              const uploads = data.data;
              questions.map((question) => {
                question.upload_id !== '-' ? question.image = `${fileHost}${uploads.find((upload: any) => {
                  return upload._id === question.upload_id;
                }).path}` : question.image = null;
              });

              const multi_choice = questions.filter((question) => question.type === 'multiple-choice');
              if (multi_choice.length > 0) {
                // tslint:disable-next-line
                this.http.get(`${host}/choice/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                  console.log(data);
                  if (data.code === 200 && data.data.length !== 0) {
                    const _choices = data.data;
                    questions.map((question) => {
                      question.choices = _choices.filter((choice) => choice.question_id === question._id).sort((a, b) => {
                        if (a.index < b.index) {
                          return -1;
                        }
                        if (a.index > b.index) {
                          return 1;
                        }
                        return 0;
                      });
                    });
                    resolve(questions);
                  } else if (data.code === 200 && data.data.length === 0) {
                    resolve(questions);
                  }
                }, error => {
                  reject(error);
                });
              } else {
                resolve(questions);
              }
            } else {
              reject(data);
            }
          });
        } else if (data.code === 200 && data.data.length === 0) {
          resolve([]);
        }
      }, error => {
        reject(error);
      });
    });
  }

  fetchResponses(survey_id: string) {
    return new Promise((resolve, reject) => {
      this.http.get(`${host}/answer/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          const answers = data.data;
          // tslint:disable-next-line
          this.http.get(`${host}/buyer/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200) {
              const buyers = data.data;
              // tslint:disable-next-line
              this.http.get(`${host}/location/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                if (data.code === 200) {
                  const locations = data.data;
                  // tslint:disable-next-line
                  this.http.get(`${host}/store_type/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                    if (data.code === 200 && data.data.length !== 0) {
                      const stores = data.data;
                      let responses = [];

                      buyers.map((buyer) => {
                        const buyerResponses = answers.filter((answer) => answer.survey_id === survey_id &&
                          answer.buyer_id === buyer._id);
                        if (buyerResponses.length > 0) {
                          buyer.responses = buyerResponses;
                          buyer.store = stores.find((store) => store._id === buyer.store_type_id).name;
                          buyer.location = locations.find((location) => location._id === buyer.location_id).name;
                          responses.push(buyer);
                        }
                      });

                      responses = responses.sort(function(a, b) {
                        const A = a.name.toLowerCase(), B = b.name.toLowerCase();
                        if (A < B) {
                          return -1;
                        }
                        if (A > B) {
                          return 1;
                        }
                        return 0;
                      });
                      resolve(responses);
                    } else {
                      reject(data);
                    }
                  }, error => {
                    reject(error);
                  });
                } else {
                  reject(data);
                }
              });
            } else {
              reject(data);
            }
          }, error => {
            reject(error);
          });
        } else {
          reject(data);
        }
      }, error => {
        reject(error);
      });
    });
  }

  delete(_id: string) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('_id', _id);

      this.http.post(`${host}/survey/delete`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          resolve();
        } else {
          reject({message: 'Delete failed'});
        }
      }, error => {
        reject({message: 'Delete failed'});
      });
    });
  }

  deleteQuestion(_id: string, survey_id: string) {
    return new Promise((resolve, reject) => {
      let form = new FormData();
      form.append('_id', _id);

      this.http.post(`${host}/question/delete`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200) {
          form = new FormData();
          form.append('survey_id', survey_id);
          // tslint:disable-next-line
          this.http.post(`${host}/question/read_by_survey`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            console.log(data);
            if (data.code === 200 && data.data.length !== 0) {
              const questions: Array<any> = data.data.sort((a, b) => {
                if (a.index < b.index) {
                  return -1;
                }
                if (a.index > b.index) {
                  return 1;
                }
                return 0;
              });
              questions.map((question, index) => {
                form = new FormData();
                form.append('_id', question._id);
                form.append('type', question.type);
                form.append('title', question.title);
                form.append('index', (index + 1).toString());
                form.append('status', question.status);
                form.append('survey_id', question.survey_id);
                form.append('upload_id', question.upload_id);

                // tslint:disable-next-line
                this.http.post(`${host}/question/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                  if (data.code === 200) {
                    // do nothing
                    if (index === questions.length - 1) {
                      resolve();
                    }
                  } else {
                    reject(data);
                  }
                }, error => {
                  reject(error);
                });
              });
            } else if (data.code === 200 && data.data.length === 0) {
              resolve();
            }
          }, error => {
            reject(error);
          });
        } else {
          reject({message: 'Delete failed'});
        }
      }, error => {
        reject({message: 'Delete failed'});
      });
    });
  }

  editQuestion(question: Question, currentQuestion: any, choices?: Array<any>, upload?: any) {
    let form = new FormData();

    return new Promise((resolve, reject) => {
      if (upload) {
        form.append('file', upload);
        form.append('tag', SecureRandString());
        form.append('title', SecureRandString());
        form.append('overwrite', 'true');

        this.http.post(`${host}/upload/upload`, form).subscribe((data: any) => {
          if (this.validate(data) === true) {
            form = new FormData();
            form.append('_id', currentQuestion._id);
            form.append('type', question.type);
            form.append('title', question.title);
            form.append('index', question.index.toString());
            form.append('status', question.status);
            form.append('survey_id', question.survey_id);
            form.append('upload_id', data.data);

            // tslint:disable-next-line
            this.http.post(`${host}/question/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
              console.log(data);
              if (data.code === 200) {
                if (choices) {
                  choices.map((choice) => {
                    form = new FormData();
                    form.append('_id', choice._id);
                    form.append('title', choice.title);
                    form.append('index', choice.index.toString());
                    form.append('status', choice.status);
                    form.append('question_id', choice.question_id);

                    // tslint:disable-next-line
                    this.http.post(`${host}/choice/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                      if (data.code === 200) {
                        // do nothing
                      } else {
                        // console.log(data);
                      }
                    }, error => {
                      reject(error);
                    });
                  });
                  resolve();
                } else {
                  resolve();
                }
              } else {
                reject(data);
              }
            }, error => {
              reject(error);
            });
          } else {
            reject(data);
          }
        }, error => {
          reject(error);
        });
      } else {
        form.append('_id', currentQuestion._id);
        form.append('type', question.type);
        form.append('title', question.title);
        form.append('index', question.index.toString());
        form.append('status', question.status);
        form.append('survey_id', question.survey_id);
        form.append('upload_id', currentQuestion.upload_id);

        this.http.post(`${host}/question/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
          console.log(data);
          if (data.code === 200) {
            if (choices) {
              choices.map((choice) => {
                form = new FormData();
                form.append('_id', choice._id);
                form.append('title', choice.title);
                form.append('index', choice.index.toString());
                form.append('status', choice.status);
                form.append('question_id', choice.question_id);

                // tslint:disable-next-line
                this.http.post(`${host}/choice/update`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                  if (data.code === 200) {
                    // do nothing
                  } else {
                    // console.log(data);
                  }
                }, error => {
                  reject(error);
                });
              });
              resolve();
            } else {
              resolve();
            }
          } else {
            reject(data);
          }
        }, error => {
          reject(error);
        });
      }
    });
  }

  fetchSurveyQs(_id: string) {
    const form = new FormData();
    form.append('survey_id', _id);
    return new Promise((resolve, reject) => {
      this.http.post(`${host}/question/read_by_survey`, form, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
        if (data.code === 200 && data.data.length !== 0) {
          const questions: Array<any> = data.data.sort((a, b) => {
            if (a.index < b.index) {
              return -1;
            }
            if (a.index > b.index) {
              return 1;
            }
            return 0;
          });
          // tslint:disable-next-line
          this.http.get(`${host}/upload/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
            if (data.code === 200) {
              const uploads = data.data;
              questions.map((question) => {
                question.upload_id !== '-' ? question.image = `${fileHost}${uploads.find((upload: any) => {
                  return upload._id === question.upload_id;
                }).path}` : question.image = null;
              });
              const multi_choice = questions.filter((question) => question.type === 'multiple-choice');
              if (multi_choice.length > 0) {
                // tslint:disable-next-line
                this.http.get(`${host}/choice/read_all`, { headers: this.dataHandler.setHeader() }).subscribe((data: any) => {
                  console.log(data);
                  if (data.code === 200 && data.data.length !== 0) {
                    const _choices = data.data;
                    questions.map((question) => {
                      question.choices = _choices.filter((choice) => choice.question_id === question._id).sort((a, b) => {
                        if (a.index < b.index) {
                          return -1;
                        }
                        if (a.index > b.index) {
                          return 1;
                        }
                        return 0;
                      });
                    });
                    resolve(questions);
                  } else if (data.code === 200 && data.data.length === 0) {
                    resolve(questions);
                  }
                }, error => {
                  reject(error);
                });
              } else {
                resolve(questions);
              }
            } else {
              reject(data);
            }
          }, error => {
            reject(error);
          });
        } else if (data.code === 200 && data.data.length === 0) {
          resolve([]);
        }
      }, error => {
        reject(error);
      });
    });
  }
}
