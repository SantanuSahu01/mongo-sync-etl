require('dotenv').config();
const { logger, MongoWatcher, logErrorAndSendEmailAlert } = require("@nutanix-products/support-tools-utils");
const connectMongo = require('./db/connect');



const init = async () => {
    try {

        const sourceDB = await connectMongo.connect(process.env.MONGO_URI_SOURCE);
        const targetDB = await connectMongo.connect(process.env.MONGO_URI_DESTINATION);


        const onChangeHandler = async (data) => {
            try {
                const { updateDescription = {}, documentKey = {}, fullDocument } = data;
                const _id = documentKey._id;

                // update with upsert
                const targetCollection = targetDB.db().collection(process.env.DESTINATION_COLLECTION);
                delete fullDocument._id;
                const update = {
                    $set: {
                        ...fullDocument,
                        etl: new Date(),
                    },
                    $setOnInsert: {
                        _id: _id,
                    },
                };
                const options = { upsert: true };
                const result = await targetCollection.findOneAndUpdate(
                    { _id: _id },
                    update,
                    options
                );
                if (result) {
                    logger.info(`Document with _id ${_id} updated successfully in target collection.`);
                } else {
                    logger.warn(`No document found with _id ${_id} in target collection.`);
                }
            } catch (error) {
                logger.error('Error processing change event:', error);
            }
        }

        const getPipeline = async () => {
            try {
                const pipe = JSON.parse(process.env.SOURCE_COLLECTION_PIPELINE) || {};
                return pipe;
            }
            catch (error) {
                logger.error('Error parsing pipeline:', error);
            }
            return {};
        };

        const predictChange = new MongoWatcher(
            {
                client: sourceDB,
                collectionName: process.env.SOURCE_COLLECTION,
                pipeline: [
                    {
                        $match: {
                            operationType: 'update',
                            ...getPipeline(),
                        }
                    },
                ],
                listeners: {
                    onChange: onChangeHandler,
                }
            },
            { from: 'Case Escalation Prediction Watcher' },
        );
        predictChange.watch();

    } catch (error) {
        console.error('Unexpected service error:', error);
        process.exit(1);
    }
};

init()