import { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions } from '@azure/storage-blob';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { DefaultAzureCredential } from '@azure/identity';


export const uploadFile = async function (containerName, filePath) {
    try {
        console.log(containerName, filePath);
        //Change the name of file to be uploaded to container_timestamp

        // Create the BlobServiceClient object
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

        // Get a reference to a container
        const containerClient = blobServiceClient.getContainerClient(containerName);

        // Create the container if it doesn't already exist
        await containerClient.createIfNotExists();

        // Generate a unique name for the blob
        const uniqueBlobName = `${uuidv4()}-${path.basename(filePath)}`;

        // Get a block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(uniqueBlobName);

        // Upload data to the blob
        console.log(`Uploading to Azure storage as blob:\n\t${uniqueBlobName}`);

        const uploadBlobResponse = await blockBlobClient.uploadFile(filePath);
        console.log(`Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`);

        return uniqueBlobName;
    } catch (error) {
        console.log(error);
        return null;
    }
}




export const generateBlobSasUrl = async function (containerName, blobName) {

    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    const sasPermissions = new BlobSASPermissions();
    sasPermissions.read = true;

    const expiresOn = new Date();
    expiresOn.setHours(expiresOn.getHours() + 1); // Set the SAS token to expire in 1 hour

    const sasToken = generateBlobSASQueryParameters({
        containerName,
        blobName,
        permissions: sasPermissions,
        startsOn: new Date(),
        expiresOn,
    }, blobServiceClient.credential);

    console.log(`Blob SAS URL: ${blobClient.url}?${sasToken}`);
    return `${blobClient.url}?${sasToken}`;
}

// const containerName = 'images';
// const blobName = 'unique-image-name.jpg';

// generateBlobSasUrl(containerName, blobName).then(url => {
//     console.log(`Blob SAS URL: ${url}`);
// }).catch(console.error);


export const downloadFile = async function (containerName, blobName, downloadFilePath) {
    // Create the BlobServiceClient object
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

    // Get a reference to a container
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Download the blob's content to a file
    console.log(`Downloading blob:\n\t${blobName}`);

    const downloadBlockBlobResponse = await blockBlobClient.downloadToFile(downloadFilePath);
    console.log(`Blob was downloaded successfully. requestId: ${downloadBlockBlobResponse.requestId}`);
}
