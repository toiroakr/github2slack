package com.toiroakr.jgit;

import com.amazonaws.services.kms.AWSKMS;
import com.amazonaws.services.kms.AWSKMSClientBuilder;
import com.amazonaws.services.kms.model.DecryptRequest;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.util.Base64;
import lombok.Data;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.InitCommand;
import org.eclipse.jgit.api.RemoteAddCommand;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.transport.RefSpec;
import org.eclipse.jgit.transport.URIish;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;

import java.io.File;
import java.net.URISyntaxException;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;

public class JGit implements RequestHandler<JGit.DeleteTarget, Boolean> {
    private static final File DIR = new File("/tmp");
    private static final File GIT_DIR = new File("/tmp/.git");

    public JGit() {
        // nothing to do
    }

    @Override
    public Boolean handleRequest(DeleteTarget input, Context context) {
        LambdaLogger logger = context.getLogger();
        logger.log(input.toString());
        try {
            Git git = init();
            addRemote(git, input.repositoryName, input.remoteUrl);
            deleteBranch(git, input.repositoryName, input.branchName);
        } catch (GitAPIException | URISyntaxException e) {
            logger.log(String.format("%s : %s", e.getClass().getName(), e.toString()));
            return false;
        }
        return true;
    }

    private static Git init() throws GitAPIException {
        DIR.mkdirs();

        InitCommand init = Git.init();
        init.setBare(false);
        init.setDirectory(DIR);
        init.setGitDir(GIT_DIR);
        return init.call();
    }

    private static void addRemote(Git git, String repositoryName, String remoteUrl) throws URISyntaxException, GitAPIException {
        RemoteAddCommand remoteAdd = git.remoteAdd();
        remoteAdd.setName(repositoryName);
        remoteAdd.setUri(new URIish(remoteUrl));
        remoteAdd.call();
    }

    private static void deleteBranch(Git git, String repositoryName, String branchName) throws GitAPIException {
        git.push()
                .setRefSpecs(createRefSpec(branchName))
                .setRemote(repositoryName)
                .setCredentialsProvider(new UsernamePasswordCredentialsProvider(getUser(), getToken()))
                .call();
    }

    private static RefSpec createRefSpec(String branchName) {
        return new RefSpec()
                .setSource(null)
                .setDestination("refs/heads/" + branchName);
    }

    private static String getUser() {
        return getEncryptedString("githubUser");
    }

    private static String getToken() {
        return getEncryptedString("token");
    }

    private static String getEncryptedString(String name) {
        byte[] encryptedKey = Base64.decode(System.getenv(name));

        AWSKMS client = AWSKMSClientBuilder.defaultClient();

        DecryptRequest request = new DecryptRequest()
                .withCiphertextBlob(ByteBuffer.wrap(encryptedKey));

        ByteBuffer plainTextKey = client.decrypt(request).getPlaintext();
        return new String(plainTextKey.array(), Charset.forName("UTF-8"));
    }

    @Data
    public static class DeleteTarget {
        private String repositoryName;
        private String remoteUrl;
        private String branchName;
    }
}
